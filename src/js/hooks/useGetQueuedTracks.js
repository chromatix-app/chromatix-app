import { useSelector } from 'react-redux';

const useGetQueuedTracks = () => {
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);
  const playingRepeatAll = useSelector(({ sessionModel }) => sessionModel.playingRepeatAll);
  const playingRepeatOnce = useSelector(({ sessionModel }) => sessionModel.playingRepeatOnce);
  const playingShuffle = useSelector(({ sessionModel }) => sessionModel.playingShuffle);

  const upcomingTrackKeys = playingTrackKeys ? playingTrackKeys.filter((_, index) => index >= playingTrackIndex) : [];
  const upcomingEntries = upcomingTrackKeys.map((key) => playingTrackList[key]);

  const isRepeat = playingRepeatAll || playingRepeatOnce;

  const repeatEntries = isRepeat && playingTrackKeys ? playingTrackKeys.map((key) => playingTrackList[key]) : [];
  // const totalTracksRemaining = playingTrackKeys ? playingTrackKeys.length - playingTrackIndex : 0;

  return {
    playingTrackList,
    playingTrackIndex,
    playingTrackKeys,
    playingRepeatAll: isRepeat,
    playingShuffle,

    upcomingTrackKeys,
    upcomingEntries,

    repeatEntries,
    // totalTracksRemaining,
  };
};

export default useGetQueuedTracks;
