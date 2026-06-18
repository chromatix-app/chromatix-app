// ======================================================================
// IMPORTS
// ======================================================================

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import App from 'js/app/App';
import getEnvironment from 'js/utils/getEnvironment';
import store from 'js/store/store';

import './css/styles.scss';

// ======================================================================
// INIT
// ======================================================================

const envData = getEnvironment();

console.log(
  '%c*************** INIT - ' +
    envData.webEnvName +
    ' - v' +
    envData.webVersion +
    ' - ' +
    envData.webBuildDate +
    ' ' +
    envData.webBuildTime +
    ' ***************',
  'font-weight:bold;color:#c70284;'
);
console.log(envData);

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
      <Analytics
        debug={false}
        beforeSend={(event) => {
          // Route sections that have a dynamic ID as their final path segment
          const dynamicRouteSections = [
            'artists',
            'album-artists',
            'albums',
            'folders',
            'playlists',
            'artist-collections',
            'album-collections',
            'artist-genres',
            'album-genres',
            'artist-moods',
            'album-moods',
            'artist-styles',
            'album-styles',
            'artist-tags',
            'album-tags',
          ];
          const dynamicSectionPattern = new RegExp(`/(${dynamicRouteSections.join('|')})/[^/?#]+`, 'g');
          const url = event.url
            // Normalise dynamic library IDs
            .replace(/\/libraries\/[^/]+/g, '/libraries/x')
            // Normalise dynamic item IDs within each library section
            .replace(dynamicSectionPattern, '/$1/x');
          return { ...event, url };
        }}
      />
    </BrowserRouter>
  </Provider>
);
