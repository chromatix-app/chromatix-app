import { useSelector } from 'react-redux';

const useGotRequiredData = (): boolean => {
  const allUsers = useSelector(({ appModel }: any) => appModel.allUsers);
  const allServers = useSelector(({ appModel }: any) => appModel.allServers);
  const allLibraries = useSelector(({ appModel }: any) => appModel.allLibraries);

  const currentService = useSelector(({ appModel }: any) => appModel.currentService);

  const currentUser = useSelector(({ sessionModel }: any) => sessionModel.currentUser);
  const currentServer = useSelector(({ sessionModel }: any) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }: any) => sessionModel.currentLibrary);

  // If we don't have users data yet, we're not ready
  if (!allUsers) {
    // console.log(111111);
    return false;
  }

  // If there are no users, we have all the data we need
  if (currentService === 'plex' && allUsers.length === 0) {
    // console.log(222222);
    return true;
  }

  // If we have users and there's no current user selected, we have all the data we need
  if (currentService === 'plex' && !currentUser) {
    // console.log(333333);
    return true;
  }

  // A CURRENT USER IS SET, CONTINUE...

  // If we don't have servers data yet, we're not ready
  if (!allServers) {
    // console.log(444444);
    return false;
  }

  // If there are no servers, we have all the data we need
  if (allServers.length === 0) {
    // console.log(555555);
    return true;
  }

  // If we have servers and there's no current server selected, we have all the data we need
  if (!currentServer) {
    // console.log(666666);
    return true;
  }

  // A CURRENT SERVER IS SET, CONTINUE...

  // If we don't have libraries data yet, we're not ready
  if (!allLibraries) {
    // console.log(777777);
    return false;
  }

  // If there are no libraries, we have all the data we need
  if (allLibraries.length === 0) {
    // console.log(888888);
    return true;
  }

  // If we have libraries and there's no current library selected, we have all the data we need
  if (!currentLibrary) {
    // console.log(999999);
    return true;
  }

  // A CURRENT LIBRARY IS SET, CONTINUE...

  // Default
  return true;
};

export default useGotRequiredData;
