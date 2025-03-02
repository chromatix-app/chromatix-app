import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useScrollToVirtualTrack = (entries, callback) => {
  const dispatch = useDispatch();

  const scrollToPlaying = useSelector(({ appModel }) => appModel.scrollToPlaying);
  const scrollToTrack = useSelector(({ appModel }) => appModel.scrollToTrack);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  // scroll to a specific track on page load, if required
  useEffect(() => {
    let trackId;

    // scroll to the currently playing track
    if (scrollToPlaying) {
      console.log('scrollToPlaying');
      const trackDetail = playingTrackList?.[playingTrackKeys[playingTrackIndex]];
      trackId = trackDetail?.trackId;
    }

    // scroll to a specified track (e.g. from search)
    else if (scrollToTrack) {
      console.log('scrollToTrack');
      trackId = scrollToTrack;
    }

    // perform the scroll
    if (trackId) {
      const trackIndex = entries.findIndex((entry) => entry.trackId === trackId);
      if (trackIndex > -1) {
        callback(trackIndex);
      }
      dispatch.appModel.setAppState({ scrollToPlaying: false, scrollToTrack: false });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToPlaying, scrollToTrack]);
};

export default useScrollToVirtualTrack;
