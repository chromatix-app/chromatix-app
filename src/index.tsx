// ======================================================================
// IMPORTS
// ======================================================================

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import moment from 'moment';

import App from 'js/app/App';
import store from 'js/store/store';

import 'css/styles.scss';

// ======================================================================
// INIT
// ======================================================================

const buildDate: string = moment(Number(process.env.REACT_APP_DATE) * 1000).format('DD/MM/YYYY HH:mm:ss');

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
// APP
// ======================================================================

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Analytics debug={false} />
    </BrowserRouter>
  </Provider>
);
