// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { ViewUsers, Loading, TitleBasic } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const UserArray = () => {
  const allUsers = useSelector(({ appModel }) => appModel.allUsers);

  return (
    <main className="wrap-inner">
      <div className="wrap-middle text-center">
        {!allUsers && <Loading forceVisible inline />}
        {allUsers && (
          <>
            <TitleBasic title={allUsers.length > 0 ? 'Select User' : 'No Users Available'} />
            <ViewUsers entries={allUsers} />
          </>
        )}
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default UserArray;
