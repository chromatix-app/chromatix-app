// Generated using GitHub Copilot

import { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as bridge from 'js/services/bridge';

// ======================================================================
// TYPES
// ======================================================================

interface PlaylistEntry {
  kind: string;
  trackId: string;
  playlistItemID: string;
}

interface UsePlaylistDragOptions {
  entries: PlaylistEntry[];
  scrollContainerRef: React.RefObject<HTMLElement>;
  playlistId: string;
  rowHeight: number;
  isDraggable: boolean;
}

interface UsePlaylistDragReturn {
  draggingItemId: string | null;
  dropIndex: number | null;
  headerHeightRef: React.MutableRefObject<number>;
  handlePointerDown: (entry: PlaylistEntry) => (e: React.PointerEvent) => void;
}

// ======================================================================
// CONSTANTS
// ======================================================================

const AUTO_SCROLL_ZONE = 80; // px from container edge to trigger auto-scroll
const AUTO_SCROLL_MAX_SPEED = 12; // max px per frame
const DRAG_THRESHOLD = 5; // px of movement before drag visually activates

// ======================================================================
// HOOK
// ======================================================================

const usePlaylistDrag = ({
  entries,
  scrollContainerRef,
  playlistId,
  rowHeight,
  isDraggable,
}: UsePlaylistDragOptions): UsePlaylistDragReturn => {
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dispatch = useDispatch();
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  // Keep refs in sync with latest prop values so stable callbacks can read current values
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const rowHeightRef = useRef(rowHeight);
  rowHeightRef.current = rowHeight;
  const playlistIdRef = useRef(playlistId);
  playlistIdRef.current = playlistId;

  // Drag state refs
  const draggingEntryRef = useRef<PlaylistEntry | null>(null);
  const draggingSourceIndexRef = useRef<number>(-1);
  const dropIndexRef = useRef<number | null>(null);
  const headerHeightRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const pointerYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const isDragActiveRef = useRef<boolean>(false);

  // Store the currently-registered window listener fns so we can remove the exact same refs
  const activeListenersRef = useRef<{
    move: (e: PointerEvent) => void;
    up: () => void;
    cancel: () => void;
  } | null>(null);

  // ----------------------------------------------------------------
  // STABLE HELPERS (read from refs, safe to call from any callback)
  // ----------------------------------------------------------------

  const computeDropIndex = useCallback(
    (clientY: number): number => {
      const container = scrollContainerRef.current;
      if (!container) return 0;
      const posInContainer = clientY - container.getBoundingClientRect().top + container.scrollTop;
      const relY = posInContainer - headerHeightRef.current;
      return Math.max(0, Math.min(entriesRef.current.length, Math.round(relY / rowHeightRef.current)));
    },
    [scrollContainerRef]
  );

  const measureHeaderHeight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const anyTrackEl = container.querySelector('[data-row]') as HTMLElement | null;
    if (anyTrackEl) {
      const rowIndex = parseInt(anyTrackEl.getAttribute('data-row-index') ?? '0', 10);
      const containerTop = container.getBoundingClientRect().top;
      const rowAbsoluteY = anyTrackEl.getBoundingClientRect().top - containerTop + container.scrollTop;
      headerHeightRef.current = rowAbsoluteY - rowIndex * rowHeightRef.current;
    }
  }, [scrollContainerRef]);

  // ----------------------------------------------------------------
  // AUTO-SCROLL
  // ----------------------------------------------------------------

  const stopAutoScroll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const tick = () => {
      const { top, bottom } = container.getBoundingClientRect();
      const py = pointerYRef.current;
      const distFromTop = py - top;
      const distFromBottom = bottom - py;

      let speed = 0;
      if (distFromTop < AUTO_SCROLL_ZONE && distFromTop > 0) {
        speed = -AUTO_SCROLL_MAX_SPEED * (1 - distFromTop / AUTO_SCROLL_ZONE);
      } else if (distFromBottom < AUTO_SCROLL_ZONE && distFromBottom > 0) {
        speed = AUTO_SCROLL_MAX_SPEED * (1 - distFromBottom / AUTO_SCROLL_ZONE);
      }

      if (speed !== 0) {
        container.scrollTop += speed;
        const newDropIndex = computeDropIndex(pointerYRef.current);
        if (newDropIndex !== dropIndexRef.current) {
          dropIndexRef.current = newDropIndex;
          setDropIndex(newDropIndex);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [scrollContainerRef, computeDropIndex]);

  // ----------------------------------------------------------------
  // DETACH WINDOW LISTENERS
  // ----------------------------------------------------------------

  const detachListeners = useCallback(() => {
    const listeners = activeListenersRef.current;
    if (!listeners) return;
    window.removeEventListener('pointermove', listeners.move);
    window.removeEventListener('pointerup', listeners.up);
    window.removeEventListener('pointercancel', listeners.cancel);
    activeListenersRef.current = null;
  }, []);

  // ----------------------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------------------

  const cleanupDrag = useCallback(() => {
    detachListeners();
    stopAutoScroll();
    draggingEntryRef.current = null;
    draggingSourceIndexRef.current = -1;
    dropIndexRef.current = null;
    isDragActiveRef.current = false;
    setDraggingItemId(null);
    setDropIndex(null);
  }, [detachListeners, stopAutoScroll]);

  // ----------------------------------------------------------------
  // COMMIT DROP
  // ----------------------------------------------------------------

  const commitDrop = useCallback(async () => {
    const draggingEntry = draggingEntryRef.current;
    const finalDropIndex = dropIndexRef.current;
    if (!draggingEntry || finalDropIndex === null) return;

    const currentEntries = entriesRef.current;
    const sourceIndex = currentEntries.findIndex((e) => e.playlistItemID === draggingEntry.playlistItemID);
    if (sourceIndex === -1) return;

    // No-op: drop line is immediately above or below the item's current position
    if (finalDropIndex === sourceIndex || finalDropIndex === sourceIndex + 1) return;

    // The item that should directly precede the dragged item in the final arrangement
    const afterEntry = finalDropIndex > 0 ? currentEntries[finalDropIndex - 1] : null;
    const afterPlaylistItemId = afterEntry?.playlistItemID ?? null;

    dispatchRef.current.appModel.showBlocker();
    try {
      await bridge.movePlaylistItem({
        playlistId: playlistIdRef.current,
        playlistItemId: draggingEntry.playlistItemID,
        afterPlaylistItemId,
      });
    } catch (error) {
      // [TODO] add error handling
    }
    dispatchRef.current.appModel.hideBlocker();
  }, []);

  // ----------------------------------------------------------------
  // POINTER DOWN HANDLER (returned to caller per-row)
  // ----------------------------------------------------------------

  const handlePointerDown = useCallback(
    (entry: PlaylistEntry) => (e: React.PointerEvent) => {
      if (!isDraggable || e.button !== 0) return;
      // No e.preventDefault() here — clicks and icon interactions pass through normally.
      // Drag only activates once the pointer moves past DRAG_THRESHOLD pixels.

      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      pointerYRef.current = e.clientY;
      isDragActiveRef.current = false;
      draggingEntryRef.current = entry;

      // Attach listeners synchronously so movement anywhere on the window is detected,
      // even before the drag threshold is crossed. Stored in activeListenersRef so
      // detachListeners() can remove the exact same references.
      const moveHandler = (me: PointerEvent) => {
        pointerYRef.current = me.clientY;

        if (!isDragActiveRef.current) {
          // Check if pointer has moved past the drag threshold
          const dx = me.clientX - startXRef.current;
          const dy = me.clientY - startYRef.current;
          if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;

          // Threshold crossed — activate drag visuals
          me.preventDefault();
          isDragActiveRef.current = true;
          draggingSourceIndexRef.current = entriesRef.current.findIndex(
            (en) => en.playlistItemID === entry.playlistItemID
          );

          measureHeaderHeight();

          const initialIndex = computeDropIndex(me.clientY);
          dropIndexRef.current = initialIndex;
          setDropIndex(initialIndex);
          setDraggingItemId(entry.playlistItemID);
          startAutoScroll();
          return;
        }

        // Drag is active — update drop index
        const newDropIndex = computeDropIndex(me.clientY);
        if (newDropIndex !== dropIndexRef.current) {
          dropIndexRef.current = newDropIndex;
          setDropIndex(newDropIndex);
        }
      };

      const upHandler = () => {
        if (isDragActiveRef.current) {
          commitDrop();
        }
        cleanupDrag();
      };

      const cancelHandler = () => {
        cleanupDrag();
      };

      activeListenersRef.current = { move: moveHandler, up: upHandler, cancel: cancelHandler };
      // passive: false required so we can call me.preventDefault() once threshold is crossed
      window.addEventListener('pointermove', moveHandler, { passive: false });
      window.addEventListener('pointerup', upHandler);
      window.addEventListener('pointercancel', cancelHandler);
    },
    [isDraggable, measureHeaderHeight, computeDropIndex, startAutoScroll, commitDrop, cleanupDrag]
  );

  // ----------------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------------

  if (!isDraggable) {
    return {
      draggingItemId: null,
      dropIndex: null,
      headerHeightRef,
      handlePointerDown: () => () => {},
    };
  }

  return {
    draggingItemId,
    dropIndex:
      dropIndex === draggingSourceIndexRef.current || dropIndex === draggingSourceIndexRef.current + 1
        ? null
        : dropIndex,
    headerHeightRef,
    handlePointerDown,
  };
};

export default usePlaylistDrag;
