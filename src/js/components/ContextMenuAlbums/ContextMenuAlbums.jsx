// ======================================================================
// IMPORTS
// ======================================================================

import { ContextMenu } from 'js/components';
import { useContextMenuAlbums } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

// Convenience wrapper that attaches an album context menu to its children.
// Renders children untouched if there are no applicable menu entries.

const ContextMenuAlbums = ({ album, showArtist, children }) => {
  const contextEntries = useContextMenuAlbums(album, { showArtist });

  return <ContextMenu entries={contextEntries}>{children}</ContextMenu>;
};

// ======================================================================
// EXPORT
// ======================================================================

export default ContextMenuAlbums;
