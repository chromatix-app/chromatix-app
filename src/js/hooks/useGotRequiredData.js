import { useSelector } from 'react-redux';

const useGotRequiredData = () => {
  const allServers = useSelector(({ appModel }) => appModel.allServers);
  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const gotRequiredData = allServers && (allLibraries || !currentLibrary) ? true : false;

  console.log(gotRequiredData, allServers, allLibraries, currentServer?.serverId, currentLibrary?.libraryId);

  return gotRequiredData;
};

export default useGotRequiredData;
