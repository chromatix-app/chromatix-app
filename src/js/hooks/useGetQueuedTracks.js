import { useSelector } from 'react-redux';

const useGetQueuedTracks = () => {
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);
  const playingRepeatAll = useSelector(({ sessionModel }) => sessionModel.playingRepeatAll);
  const playingRepeatOnce = useSelector(({ sessionModel }) => sessionModel.playingRepeatOnce);
  const playingShuffle = useSelector(({ sessionModel }) => sessionModel.playingShuffle);

  const queueTrackKeys = playingTrackKeys ? playingTrackKeys.filter((_, index) => index >= playingTrackIndex) : [];
  const queueEntries = queueTrackKeys.map((key) => playingTrackList[key]);

  const playingRepeatAny = playingRepeatAll || playingRepeatOnce;

  const queueCurrent = queueEntries[0];
  const queueUpcoming = queueEntries.slice(1);
  const queueRepeat = playingRepeatAny && playingTrackKeys ? playingTrackKeys.map((key) => playingTrackList[key]) : [];

  return {
    playingTrackIndex,
    playingTrackKeys,
    playingRepeatAny,
    playingShuffle,

    queueCurrent,
    queueUpcoming,
    queueRepeat,
  };
};

export default useGetQueuedTracks;
