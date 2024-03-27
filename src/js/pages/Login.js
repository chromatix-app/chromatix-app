// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { Button, Title } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Login = () => {
  const dispatch = useDispatch();

  return (
    <main className="wrap-middle text-center">
      <div>
        <Title title="Chromatix" />
        <div className="mt-20"></div>
        <Button
          onClick={() => {
            dispatch.appModel.login();
          }}
        >
          Login with Plex
        </Button>
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Login;
