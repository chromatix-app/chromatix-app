// ======================================================================
// COMPONENT
// ======================================================================

export const PlaybackErrorMessage = ({ trackTitle, trackArtist }) => (
  <>
    <em>"{trackTitle}"</em> by <em>{trackArtist}</em> could not be played.
  </>
);

// ======================================================================
// EXPORT
// ======================================================================

export default PlaybackErrorMessage;
