// ======================================================================
// IMPORTS
// ======================================================================

import { ContextMenu } from 'js/components';
import { useContextMenuPlaylists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

// Convenience wrapper that attaches a playlist context menu to its children.
// Renders children untouched if there are no applicable menu entries.

const ContextMenuPlaylists = ({ playlist, showPlay, children }) => {
  const contextEntries = useContextMenuPlaylists(playlist, { showPlay });

  return <ContextMenu entries={contextEntries}>{children}</ContextMenu>;
};

// ======================================================================
// EXPORT
// ======================================================================

export default ContextMenuPlaylists;
