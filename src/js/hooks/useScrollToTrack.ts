import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Custom hook that handles automatic scrolling to specific tracks in the DOM.
 * Scrolls to currently playing track or a specified track using native scrollIntoView.
 */

const useScrollToTrack = (): void => {
  const dispatch = useDispatch();

  const scrollToPlaying = useSelector(({ appModel }: any) => appModel.scrollToPlaying);
  const scrollToTrack = useSelector(({ appModel }: any) => appModel.scrollToTrack);

  const playingVariant = useSelector(({ sessionModel }: any) => sessionModel.playingVariant);
  const playingTrackList = useSelector(({ sessionModel }: any) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }: any) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }: any) => sessionModel.playingTrackKeys);

  const viewArtistAlbums = useSelector(({ sessionModel }: any) => sessionModel.viewArtistAlbums);

  // scroll to a specific track on page load, if required
  useEffect(() => {
    let trackId: string | undefined;

    // scroll to the currently playing track
    if (scrollToPlaying) {
      // console.log('scrollToPlaying');
      if (playingVariant === 'artists' && viewArtistAlbums !== 'track') {
        dispatch.sessionModel.setSessionState({ viewArtistAlbums: 'track' });
      } else {
        const trackDetail = playingTrackList?.[playingTrackKeys[playingTrackIndex]];
        trackId = trackDetail?.trackId;
      }
    }

    // scroll to a specified track (e.g. from search)
    else if (scrollToTrack) {
      // console.log('scrollToTrack');
      trackId = scrollToTrack;
    }

    // perform the scroll
    if (trackId) {
      const playingElement = document.getElementById(trackId);
      if (playingElement) {
        playingElement.scrollIntoView({
          behavior: 'instant',
          block: 'center',
        });
      }
      dispatch.appModel.setAppState({ scrollToPlaying: false, scrollToTrack: false });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToPlaying, scrollToTrack, viewArtistAlbums]);
};

export default useScrollToTrack;
