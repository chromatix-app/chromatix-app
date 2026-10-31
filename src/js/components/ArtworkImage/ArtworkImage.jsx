// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';

// ======================================================================
// COMPONENT
// ======================================================================

// Artwork <img> that renders nothing once its src fails to load, so the parent's placeholder shows instead.
// Tracks the failed src (not a flag) so a reused element resets when given new artwork, e.g. in virtual lists.
const ArtworkImage = ({ src, ...props }) => {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return null;
  }

  return <img src={src} draggable="false" onError={() => setFailedSrc(src)} {...props} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtworkImage;
