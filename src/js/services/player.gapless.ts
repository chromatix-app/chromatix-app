// ======================================================================
// IMPORTS
// ======================================================================

import { Queue } from 'gapless';
import type { GaplessInitParams, GaplessQueueEntry, GaplessQueueFlags, PlayerTrack } from 'types/player';
import getOperatingSystemName from 'js/utils/getOperatingSystemName';
import requiresTranscoding from 'js/utils/requiresTranscoding';

// ======================================================================
// OVERVIEW
// ======================================================================

// True gapless playback via the gapless.js hybrid engine: every track starts
// instantly on a streaming HTML5 element, is decoded to a Web Audio buffer in
// the background, and crosses over mid-song so that track boundaries can be
// scheduled sample-accurately on the AudioContext clock.
//
// The Rematch store remains the single source of truth for the queue. This
// module keeps a QUEUE MIRROR (syncQueue) and feeds the engine a small
// sliding WINDOW of upcoming tracks — enough for the engine to preload and
// schedule the next boundary, without creating an element per queued track.
// When the engine crosses a boundary on its own, onGaplessSeamAdvance tells
// the store to advance WITHOUT reloading the player.
//
// Only browser-direct-playable codecs participate (a server transcode is a
// fresh lossy session — there is no gapless continuity to preserve). When the
// window hits a transcode-needed track or the queue end, the chain simply
// ends there and the normal onEnded -> playerNext flow takes over.

// ======================================================================
// OPTIONS
// ======================================================================

// How many upcoming tracks the engine sees beyond the current one. One is
// enough for gapless scheduling (preloadNumTracks below); a second gives the
// window slack while the store re-syncs after each seam.
const WINDOW_AHEAD = 2;

// How many tracks beyond the current one the engine fetches + decodes.
// Each decoded track holds its full PCM in memory (~21MB per minute of
// 44.1kHz stereo), so keep this at 1: current + next.
const PRELOAD_NUM_TRACKS = 1;

// ======================================================================
// STATE
// ======================================================================

let callbacks: GaplessInitParams | null = null;

// Toggled from the store (Settings -> Playback -> Gapless playback).
let enabled = false;

// The store-owned queue, mirrored via syncQueue(): entries in playback order
// (playingTrackKeys order) plus the repeat flags needed to predict "next".
let entries: GaplessQueueEntry[] = [];
let flags: GaplessQueueFlags = { repeatOnce: false, repeatAll: false };

// The live engine and its window. engineToQueueIndex maps engine positions
// to store queue positions (repeat-once appends the same track twice, so
// this is not always monotonic).
let queue: Queue | null = null;
let engineToQueueIndex: number[] = [];
// The engine position we believe is current due to our own actions; a
// STARTED event for any LATER position is a seam the engine crossed itself.
let expectedEngineIndex = 0;
// Suppresses engine callbacks while this module is (re)building the window.
let suppress = false;

let volumeLevel = 100;

// ======================================================================
// SUPPORT / ROUTING PREDICATES
// ======================================================================

/**
 * Gapless playback needs the Web Audio API and a platform where it is viable
 * for music: iOS Safari silences Web Audio via the hardware mute switch and
 * suspends the AudioContext on screen lock, so iOS keeps the plain player.
 */
export const isSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!('AudioContext' in window) && !('webkitAudioContext' in window)) return false;
  return getOperatingSystemName() !== 'iOS';
};

export const setEnabled = (value: boolean): void => {
  enabled = !!value;
  if (!enabled) {
    unload();
  }
};

const isEnabled = (): boolean => enabled && isSupported();

/**
 * Whether this engine should handle the given track. Requires the gapless
 * setting to be on, a supported platform, a direct-playable codec, and the
 * track to match the store queue position the caller says it occupies.
 */
export const canPlay = (track: PlayerTrack, queueIndex?: number): boolean => {
  if (!isEnabled()) return false;
  if (queueIndex === undefined || queueIndex === null) return false;
  if (requiresTranscoding(track.codec)) return false;
  return entries[queueIndex]?.src === track.src;
};

// ======================================================================
// INITIALISE / UNLOAD
// ======================================================================

export const init = (params: GaplessInitParams): void => {
  callbacks = params;
  volumeLevel = params.volumeMuted ? 0 : params.volumeLevel;
};

export const unload = (): void => {
  if (queue) {
    console.log('%c--- .gapless - unload ---', 'color:#1d9a6c');
    suppress = true;
    try {
      queue.destroy();
    } finally {
      suppress = false;
    }
  }
  queue = null;
  engineToQueueIndex = [];
  expectedEngineIndex = 0;
};

// ======================================================================
// QUEUE MIRROR
// ======================================================================

/**
 * Mirror the store queue (in playback order) and repeat flags. Cheap — no
 * engine work happens here. Called whenever the queue, shuffle order or
 * repeat flags change; also re-arms the engine window tail so the scheduled
 * next track always matches what the store would play next.
 */
export const syncQueue = (newEntries: GaplessQueueEntry[], newFlags: GaplessQueueFlags): void => {
  entries = newEntries || [];
  flags = { repeatOnce: !!newFlags?.repeatOnce, repeatAll: !!newFlags?.repeatAll };
  reconcileTail();
};

/** The store queue position that plays after `queueIndex`, or null at the end. */
const nextQueueIndex = (queueIndex: number): number | null => {
  if (flags.repeatOnce) return queueIndex;
  if (queueIndex + 1 < entries.length) return queueIndex + 1;
  if (flags.repeatAll && entries.length > 0) return 0;
  return null;
};

/** Whether an entry can be part of a gapless chain (direct play only). */
const chainable = (entry: GaplessQueueEntry | undefined): entry is GaplessQueueEntry => {
  return !!entry && !requiresTranscoding(entry.codec);
};

/** The desired window sequence (store queue positions) starting at `start`. */
const windowSequence = (start: number): number[] => {
  const seq = [start];
  let current = start;
  for (let n = 0; n < WINDOW_AHEAD; n++) {
    const next = nextQueueIndex(current);
    if (next === null || !chainable(entries[next])) break;
    seq.push(next);
    current = next;
  }
  return seq;
};

const entryMetadata = (entry: GaplessQueueEntry) => ({
  title: entry.title,
  artist: entry.artist,
  album: entry.album,
  ...(entry.thumbMd ? { artwork: [{ src: entry.thumbMd }] } : {}),
});

/**
 * Align the engine's upcoming tracks with the store's expectations. Removes
 * tail entries that no longer match (e.g. repeat or shuffle changed) and
 * appends missing ones, without touching the currently playing track.
 */
const reconcileTail = (): void => {
  if (!queue) return;
  const currentQueueIndex = engineToQueueIndex[expectedEngineIndex];
  if (currentQueueIndex === undefined) return;
  const desired = windowSequence(currentQueueIndex);

  suppress = true;
  try {
    // Drop mismatched or surplus engine entries from the end, down to the
    // current track.
    for (let engineIdx = engineToQueueIndex.length - 1; engineIdx > expectedEngineIndex; engineIdx--) {
      const desiredQueueIdx = desired[engineIdx - expectedEngineIndex];
      const actualQueueIdx = engineToQueueIndex[engineIdx];
      const desiredEntry = desiredQueueIdx === undefined ? undefined : entries[desiredQueueIdx];
      if (!desiredEntry || desiredEntry.src !== entries[actualQueueIdx]?.src || desiredQueueIdx !== actualQueueIdx) {
        queue.removeTrack(engineIdx);
        engineToQueueIndex.splice(engineIdx, 1);
      }
    }
    // Append what's missing.
    for (let offset = engineToQueueIndex.length - expectedEngineIndex; offset < desired.length; offset++) {
      const entry = entries[desired[offset]];
      queue.addTrack(entry.src, { skipHEAD: true, metadata: entryMetadata(entry) });
      engineToQueueIndex.push(desired[offset]);
    }
  } finally {
    suppress = false;
  }
};

// ======================================================================
// ENGINE WINDOW
// ======================================================================

const buildWindow = (startQueueIndex: number): void => {
  unload();

  const seq = windowSequence(startQueueIndex);
  engineToQueueIndex = seq;
  expectedEngineIndex = 0;

  console.log('%c--- .gapless - build window ---', 'color:#1d9a6c');

  queue = new Queue({
    tracks: seq.map((queueIdx) => entries[queueIdx].src),
    trackMetadata: seq.map((queueIdx) => entryMetadata(entries[queueIdx])),
    volume: volumeLevel / 100,
    preloadNumTracks: PRELOAD_NUM_TRACKS,
    playbackMethod: 'HYBRID',
    onStartNewTrack: (info) => {
      if (suppress || !callbacks) return;
      if (info.index === expectedEngineIndex) return; // echo of our own action
      // The engine crossed a track boundary by itself — a gapless seam.
      expectedEngineIndex = info.index;
      const queueIndex = engineToQueueIndex[info.index];
      if (queueIndex !== undefined) {
        callbacks.onGaplessSeamAdvance({ index: queueIndex });
      }
    },
    onEnded: () => {
      // The engine window is exhausted: either the real end of the queue, or
      // the chain stopped at a transcode-needed track. Both are handled by
      // the store's normal ended -> next flow.
      if (suppress || !callbacks) return;
      callbacks.onEnded();
    },
    onError: (error: Error) => {
      if (suppress || !callbacks) return;
      console.error('%c--- .gapless - error ---', 'color:#f00', error);
      callbacks.onGaplessError({
        errorCode: 'GAPLESS_MEDIA_ERROR',
        errorMessage: error?.message || 'The gapless engine could not play the track',
      });
    },
    onPlayBlocked: () => {
      if (suppress || !callbacks) return;
      callbacks.onGaplessPlayBlocked();
    },
  });
};

const startPlayback = (): void => {
  if (!queue) return;
  // The AudioContext may be suspended by autoplay policy until a gesture —
  // resuming here covers gesture-driven plays; blocked resumes surface via
  // onPlayBlocked when play() fails.
  queue.resumeAudioContext().catch(() => null);
  queue.play();
};

// ======================================================================
// LOAD TRACK
// ======================================================================

/**
 * Load a track at a given store queue position. Returns `false` when this
 * engine cannot handle the track (the router falls through to the other
 * players).
 */
export const loadTrack = (
  track: PlayerTrack,
  progress: number = 0,
  play: boolean = true,
  queueIndex?: number
): boolean => {
  if (!canPlay(track, queueIndex)) return false;

  console.log('%c--- .gapless - loadTrack ---', 'color:#1d9a6c');
  callbacks?.onLoadStart();

  const isCurrentTrack =
    queue !== null && engineToQueueIndex[expectedEngineIndex] === queueIndex && entries[queueIndex!]?.src === track.src;

  if (isCurrentTrack) {
    // Same track re-requested (session refresh, resume-after-error, restart
    // with progress): reuse the loaded window rather than rebuilding it.
    if (progress) queue!.seek(progress / 1000);
    if (play) {
      startPlayback();
    } else {
      queue!.pause();
    }
    callbacks?.onCanPlay();
    return true;
  }

  buildWindow(queueIndex!);
  suppress = true;
  try {
    queue!.gotoTrack(0, false);
    if (progress) queue!.seek(progress / 1000);
  } finally {
    suppress = false;
  }
  if (play) startPlayback();
  // The HTML5 leg streams immediately; report ready so the loading spinner
  // debounce in the store clears.
  callbacks?.onCanPlay();
  return true;
};

// ======================================================================
// PLAYBACK CONTROLS
// ======================================================================

export const pause = (): void => {
  queue?.pause();
};

export const resume = (): void => {
  startPlayback();
};

export const restart = (): void => {
  if (queue) {
    queue.seek(0);
    startPlayback();
  }
};

// ======================================================================
// VOLUME
// ======================================================================

export const setVolume = (newVolumeLevel: number): void => {
  volumeLevel = newVolumeLevel;
  queue?.setVolume(newVolumeLevel / 100);
};

// ======================================================================
// PROGRESS
// ======================================================================

export const setProgress = (progress: number): void => {
  queue?.seek(progress / 1000);
};

export const getCurrentProgress = (): number => {
  return queue?.currentTrack?.currentTime || 0;
};
