// ======================================================================
// IMPORTS
// ======================================================================

import { ContextMenu } from 'js/components';
import { useContextMenuArtists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

// Convenience wrapper that attaches an artist context menu to its children.
// Renders children untouched if there are no applicable menu entries.

const ContextMenuArtists = ({ artist, showArtist, showPlay, children }) => {
  const contextEntries = useContextMenuArtists(artist, { showArtist, showPlay });

  return <ContextMenu entries={contextEntries}>{children}</ContextMenu>;
};

// ======================================================================
// EXPORT
// ======================================================================

export default ContextMenuArtists;
