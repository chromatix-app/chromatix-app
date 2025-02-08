import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useScrollToTrack = () => {
  const dispatch = useDispatch();

  const scrollToPlaying = useSelector(({ appModel }) => appModel.scrollToPlaying);
  const scrollToTrack = useSelector(({ appModel }) => appModel.scrollToTrack);

  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);

  const trackDetail = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

  // scroll to a speciic track on page load, if required
  useEffect(() => {
    // scroll to the currently playing track
    if (scrollToPlaying) {
      const playingElement = document.getElementById(trackDetail?.trackId);
      if (playingElement) {
        playingElement.scrollIntoView({ block: 'center' });
      }
      dispatch.appModel.setAppState({ scrollToPlaying: false });
    }

    // scroll to a specified track
    else if (scrollToTrack) {
      const playingElement = document.getElementById(scrollToTrack);
      if (playingElement) {
        playingElement.scrollIntoView({ block: 'center' });
      }
      dispatch.appModel.setAppState({ scrollToTrack: false });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToPlaying]);
};

export default useScrollToTrack;
