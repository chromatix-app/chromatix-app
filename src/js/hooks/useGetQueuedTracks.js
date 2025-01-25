import { useSelector } from 'react-redux';

const useGetQueuedTracks = () => {
  const playingTrackList = useSelector(({ sessionModel }) => sessionModel.playingTrackList);
  const playingTrackIndex = useSelector(({ sessionModel }) => sessionModel.playingTrackIndex);
  const playingTrackKeys = useSelector(({ sessionModel }) => sessionModel.playingTrackKeys);
  const playingRepeat = useSelector(({ sessionModel }) => sessionModel.playingRepeat);
  const playingShuffle = useSelector(({ sessionModel }) => sessionModel.playingShuffle);

  const upcomingTrackKeys = playingTrackKeys ? playingTrackKeys.filter((_, index) => index >= playingTrackIndex) : [];
  const upcomingEntries = upcomingTrackKeys.map((key) => playingTrackList[key]);

  const repeatEntries = playingRepeat && playingTrackKeys ? playingTrackKeys.map((key) => playingTrackList[key]) : [];
  const totalTracksRemaining = playingTrackKeys ? playingTrackKeys.length - playingTrackIndex : 0;

  return {
    playingTrackList,
    playingTrackIndex,
    playingTrackKeys,
    playingRepeat,
    playingShuffle,

    upcomingTrackKeys,
    upcomingEntries,

    repeatEntries,
    totalTracksRemaining,
  };
};

export default useGetQueuedTracks;
