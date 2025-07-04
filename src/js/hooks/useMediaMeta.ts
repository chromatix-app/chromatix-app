import { useEffect } from 'react';

interface MediaMetadataInit {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: {
    src: string;
    sizes?: string;
    type?: string;
  }[];
}

/**
 * Custom hook that sets media metadata for the browser's Media Session API.
 * Updates the metadata displayed in media notifications and control centers.
 * @param metadata - Media metadata object with title, artist, album, and artwork
 */

const useMediaMeta = (metadata: MediaMetadataInit): null => {
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }
  }, [metadata]);

  return null;
};

export default useMediaMeta;
