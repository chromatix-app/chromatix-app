# Gapless Playback

Chromatix supports true gapless playback — consecutive tracks play with **zero gap**, using sample-accurate transitions scheduled on the Web Audio clock. It is off by default and enabled under **Settings → Playback → Gapless Playback**.

## Table of contents<!-- omit in toc -->

- [1. What you get](#1-what-you-get)
- [2. How it works](#2-how-it-works)
  - [2.1. The engine](#21-the-engine)
  - [2.2. The queue mirror and the window](#22-the-queue-mirror-and-the-window)
  - [2.3. Seam advances](#23-seam-advances)
- [3. What is (and isn't) gapless](#3-what-is-and-isnt-gapless)
- [4. Trade-offs](#4-trade-offs)
- [5. Files involved](#5-files-involved)

## 1. What you get

With the setting enabled, any run of consecutive tracks that your browser can play directly (FLAC, MP3, AAC, OGG, WAV — i.e. anything that doesn't need server transcoding) plays back-to-back with no audible seam: live albums, DJ mixes, and classical works flow continuously. Shuffle and both repeat modes stay gapless, including repeat-one. Play/pause, seeking, the volume slider, the progress bar, and media keys all behave exactly as before.

## 2. How it works

### 2.1. The engine

True gapless is impossible with `<audio>` elements alone: you cannot predict, from JavaScript, the exact moment an element will finish (event timing, buffering, and codec padding all get in the way). The only sample-accurate clock a web page has is the Web Audio API's `AudioContext`.

Chromatix wraps [gapless.js](https://github.com/RelistenNet/gapless.js) (MIT, actively maintained, production-proven on relisten.net) as a fourth sub-player behind the existing player router (`player.native.ts` / `player.dash.ts` / `player.gapless.ts`). The library implements the hybrid architecture:

1. Every track **starts instantly** on a streaming HTML5 element (no waiting for a full download).
2. In the background the file is fetched and decoded into a Web Audio buffer.
3. Mid-song, playback **crosses over** to Web Audio — from that point the track lives on the `AudioContext` clock.
4. The next track's buffer is scheduled to start at the _exact sample_ the current one ends. No prediction, no timers, no gap.

Encoder delay/padding (the silence baked into MP3/AAC frames) is trimmed by the browser's decoder from LAME/iTunes gapless metadata, which current Chrome, Firefox, and Safari all honour.

### 2.2. The queue mirror and the window

The Rematch store remains the single source of truth for the play queue. `player.gapless.ts` keeps a cheap mirror of the queue (in `playingTrackKeys` order) plus the repeat flags, and feeds the engine only a small **sliding window** — the current track plus the next two — so long queues don't allocate resources per track. The window respects playback semantics:

- **Shuffle** — the mirror is already in shuffled order, so shuffled playback is gapless too.
- **Repeat one** — the same track is queued again behind itself; even repeat-one is seamless.
- **Repeat all** — the window wraps from the last track to the first.
- **Toggling repeat/shuffle mid-track** — the store re-syncs the mirror and the engine window tail is reconciled (stale entries removed, correct ones appended) without touching the playing track.

### 2.3. Seam advances

When the engine crosses a track boundary by itself, it notifies the store (`playerSeamAdvance`), which advances `playingTrackIndex`, resets the progress bar, reports the new track to your Plex/Jellyfin server for play history, and re-arms the window — all **without reloading the player**, because the next track is already playing.

Everything else (user-initiated next/prev/click, queue end, errors) flows through the exact same store logic as before.

## 3. What is (and isn't) gapless

| Transition                                                                 | Gapless?                                                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Direct-play → direct-play (FLAC/MP3/AAC/OGG/WAV)                           | **Yes — sample-accurate**                                                                               |
| Anything involving a server-transcoded track (e.g. ALAC/WMA via Plex DASH) | No — plays via the standard player with a normal gap                                                    |
| Repeat-one / repeat-all wrap / shuffled order                              | Yes (repeat-all wrap of the _whole queue_ has a seam only when the queue ends on a non-chainable track) |
| Manual skip / seek / play from a page                                      | Instant, but not a "seam" — starts fresh like today                                                     |

Transcoded tracks can't be gapless in _any_ architecture: each transcode is a fresh lossy encode with its own priming/padding, so there is no continuous audio to preserve. (For context: Plex's own web app has no gapless at all, and Plexamp achieves it with a native audio engine outside the browser.)

## 4. Trade-offs

Stated plainly, because they're why this ships as an opt-in beta:

- **Memory** — decoded audio is raw PCM (~21 MB per minute of 44.1 kHz stereo). With the preload window at current + 1, expect a few hundred MB of additional memory during playback, more for hi-res files. Fine on desktop; it's why iOS is excluded.
- **iOS is excluded** — the hardware mute switch silences Web Audio, and screen-lock suspends the `AudioContext` mid-album. iOS keeps the standard player and the setting explains why.
- **CORS** — the decode step fetches files with `fetch()`, which needs CORS headers from the media server (unlike `<audio src>`). Jellyfin sends them; Plex servers generally allow the app origin. When a fetch is blocked, the track simply keeps playing on its HTML5 element — you lose the seamless seam for that track, never playback.
- **The mid-track crossover** from HTML5 to Web Audio can, rarely, produce a tiny audible blip (a known property of the hybrid architecture, worst on Firefox).
- **Hi-res is resampled** — Web Audio decodes to the context sample rate, so 96/24 material is resampled while gapless is on. Bit-perfect listeners should leave the toggle off.

## 5. Files involved

| File                                  | Role                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/js/services/player.gapless.ts`   | The engine wrapper: support/routing predicates, queue mirror, sliding window, seam detection       |
| `src/js/services/player.ts`           | Player router: routes direct-play tracks to the gapless engine while the setting is on             |
| `src/js/store/models.player.js`       | `playerSyncGaplessQueue`, `playerSeamAdvance`, `playerGaplessToggle`, `playerGaplessError` effects |
| `src/js/components/SettingsPlayback/` | The toggle (replaces the previous "not currently supported" notice)                                |
| `src/js/components/SettingsList/`     | Gained optional per-item `onChange` so settings can dispatch effects                               |
| `src/types/player.ts`                 | Shared player types incl. the gapless callbacks and queue-entry shapes                             |
