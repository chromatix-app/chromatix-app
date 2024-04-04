import { useSelector } from 'react-redux';

const useGotRequiredData = () => {
  const allServers = useSelector(({ appModel }) => appModel.allServers);
  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  // const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const gotRequiredData = allServers && (allServers.length === 0 || allLibraries || !currentLibrary) ? true : false;

  // console.log(gotRequiredData, allServers, allLibraries, currentLibrary?.libraryId);

  return gotRequiredData;
};

export default useGotRequiredData;
