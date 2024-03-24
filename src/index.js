// ======================================================================
// IMPORTS
// ======================================================================

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import moment from 'moment';

import App from 'js/app/App';
import store from 'js/store/store';

import 'css/styles.scss';

// ======================================================================
// INIT
// ======================================================================

const buildDate = moment(process.env.REACT_APP_DATE * 1000).format('DD/MM/YYYY HH:mm:ss');

console.log(
  '%c*************** INIT - ' +
    process.env.REACT_APP_ENV +
    ' - v' +
    process.env.REACT_APP_VERSION +
    ' - ' +
    buildDate +
    ' ***************',
  'font-weight:bold;color:#c70284;'
);

// ======================================================================
// RENDER
// ======================================================================

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
