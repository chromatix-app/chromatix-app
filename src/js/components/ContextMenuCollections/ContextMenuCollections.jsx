// ======================================================================
// IMPORTS
// ======================================================================

import { ContextMenu } from 'js/components';
import { useContextMenuCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

// Convenience wrapper that attaches a collection context menu to its children.
// Renders children untouched if there are no applicable menu entries.

const ContextMenuCollections = ({ collection, children }) => {
  const contextEntries = useContextMenuCollections(collection);

  return <ContextMenu entries={contextEntries}>{children}</ContextMenu>;
};

// ======================================================================
// EXPORT
// ======================================================================

export default ContextMenuCollections;
