import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface WhatsNewEntry {
  version: string;
  bannerTitle?: string;
  title: string;
  date?: string;
  body: ReactNode;
  imageDark: string;
  imageLight: string;
}

export const whatsNew: WhatsNewEntry[] = [
  {
    version: '0.60.0',
    bannerTitle: 'Playlist management, Linux apps, and more…',
    title: 'Playlist management',
    date: 'June 2026',
    body: (
      <>
        <p>You can now create, edit, and delete playlists directly within Chromatix.</p>
        <p>
          Tracks can be added and removed from any playlist, and you can drag and drop playlist tracks to reorder them
          however you like.
        </p>
      </>
    ),
    imageDark: 'promo-015-dark',
    imageLight: 'promo-015-light',
  },

  {
    version: '0.60.0',
    title: 'Linux desktop apps',
    date: 'June 2026',
    body: (
      <>
        <p>Chromatix is now available as a desktop app for Linux, joining the existing macOS and Windows apps.</p>
        <p>
          Head to the <NavLink to="/settings/downloads">downloads</NavLink> page to grab the latest build for your
          platform.
        </p>
      </>
    ),
    imageDark: 'promo-014-dark',
    imageLight: 'promo-014-light',
  },

  {
    version: '0.60.0',
    title: 'Get in touch',
    // date: 'June 2026',
    body: (
      <>
        <p>Have a suggestion, spotted a bug, or just want to share some feedback? We&apos;d love to hear from you.</p>
        <p>
          Visit the <NavLink to="/settings">settings</NavLink> page to find links for getting in touch and keeping up
          with what&apos;s new.
        </p>
      </>
    ),
    imageDark: 'promo-013-dark',
    imageLight: 'promo-013-light',
  },

  // {
  //   version: '0.57.0',
  //   bannerTitle: 'Plex Home user switching is now available.',
  //   title: 'Plex Home user switching',
  //   date: 'January 2026',
  //   body: `<p>Plex accounts with multiple users configured via Plex Home can now easily switch between users within Chromatix.</p>
  //   <p>Just click the "Switch User" option in the user menu to get started.</p>`,
  //   imageDark: 'promo-012-dark',
  //   imageLight: 'promo-012-light',
  // },

  // {
  //   version: '0.52.0',
  //   bannerTitle: 'Jellyfin server support is now available.',
  //   title: 'Jellyfin support',
  //   date: 'September 2025',
  //   body: `<p>Jellyfin users can now enjoy their music libraries in Chromatix too!</p>
  //   <p>Right now you can only log into one service at a time, and settings are not shared between accounts, but we hope to add multiple account support soon.</p>`,
  //   imageDark: 'promo-011-dark',
  //   imageLight: 'promo-011-light',
  // },

  // {
  //   version: '0.51.0',
  //   title: 'Full screen player',
  //   date: 'August 2025',
  //   body: `<p>Chromatix has a brand new full screen player mode!</p>
  //   <p>Click the new full screen icon in the bottom toolbar to try it out. You have access to all your music controls, and can also click the settings icon for customisation options.</p>`,
  //   imageDark: 'promo-010-dark',
  //   imageLight: 'promo-010-light',
  // },

  // {
  //   version: '0.41.0',
  //   title: 'Artist track view',
  //   date: 'May 2025',
  //   body: `<p>A new track view has been added to artist pages, allowing you to view, play and shuffle all tracks by an artist in one go.</p>
  //   <p>Plus, the user menu and filter menus have been redesigned and rebuilt for better clarity and accessibility.</p>`,
  //   imageDark: 'promo-009-dark',
  //   imageLight: 'promo-009-light',
  // },

  // {
  //   version: '0.37.0',
  //   title: 'Column options',
  //   date: 'April 2025',
  //   body: `<p>List view columns can now be customised, allowing you to show and hide the fields you want. New fields have also been added, such as audio codec and bitrate.</p>
  //   <p>Plus, the long-requested “repeat one track” capability has been added in.</p>`,
  //   imageDark: 'promo-008-dark',
  //   imageLight: 'promo-008-light',
  // },

  // {
  //   version: '0.32.0',
  //   title: 'Search & folders',
  //   date: 'Feb 2025',
  //   body: `<p>A search bar has been added to the main menu, letting you search for artists, albums, tracks, playlists, and more.</p>
  //   <p>Additionally, there’s a new section for browsing your library folders directly, as requested by several of our users.</p>`,
  //   imageDark: 'promo-007-dark',
  //   imageLight: 'promo-007-light',
  // },
];

export default whatsNew;
