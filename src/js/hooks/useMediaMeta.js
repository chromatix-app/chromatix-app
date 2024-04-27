import { useEffect } from 'react';

const useMediaMeta = (metadata) => {
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }
  }, [metadata]);

  return null;
};

export default useMediaMeta;
