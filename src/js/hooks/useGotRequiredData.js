import { useSelector } from 'react-redux';

const useGotRequiredData = () => {
  const allServers = useSelector(({ appModel }) => appModel.allServers);
  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const gotRequiredData = allServers && (allLibraries || !currentLibrary) ? true : false;

  console.log(gotRequiredData);

  return gotRequiredData;
};

export default useGotRequiredData;
