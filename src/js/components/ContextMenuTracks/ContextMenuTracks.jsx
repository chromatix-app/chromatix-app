// ======================================================================
// IMPORTS
// ======================================================================

import { ContextMenu } from 'js/components';
import { useContextMenuTracks } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

// Convenience wrapper that attaches a track context menu to its children.
// Renders children untouched if there are no applicable menu entries.

const ContextMenuTracks = ({ track, playlistId, showArtist, showAlbum, children }) => {
  const contextEntries = useContextMenuTracks(track, { playlistId, showArtist, showAlbum });

  return <ContextMenu entries={contextEntries}>{children}</ContextMenu>;
};

// ======================================================================
// EXPORT
// ======================================================================

export default ContextMenuTracks;
