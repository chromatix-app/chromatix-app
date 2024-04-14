// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import { themes } from 'js/_config/themes';
import { Icon } from 'js/components';

import style from './Settings.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const Settings = () => {
  return (
    <div className={style.wrap}>
      <div className={style.entry}>
        <div className={style.title}>Theme</div>
        <ThemeSettings />
      </div>
      <div className={style.entry}>
        <div className={style.title}>Options</div>
        <OptionSettings />
      </div>
      <div className={style.entry}>
        <div className={style.title}>Customise Menu</div>
        <MenuSettings />
      </div>
    </div>
  );
};

//
// THEME
//

const ThemeSettings = () => {
  const dispatch = useDispatch();

  const currentTheme = useSelector(({ sessionModel }) => sessionModel.currentTheme);
  const currentColorBackground = useSelector(({ sessionModel }) => sessionModel.currentColorBackground);
  const currentColorText = useSelector(({ sessionModel }) => sessionModel.currentColorText);
  const currentColorPrimary = useSelector(({ sessionModel }) => sessionModel.currentColorPrimary);

  const groupedThemes = Object.entries(themes).reduce((groups, [themeName, themeDetails]) => {
    const group = themeDetails.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push([themeName, themeDetails]);
    return groups;
  }, {});

  return (
    <>
      {Object.entries(groupedThemes).map(([groupName, groupThemes], groupIndex) => (
        <div key={groupIndex} className={style.themes}>
          {groupThemes.map(([themeName, themeDetails], themeIndex) => (
            <button
              key={themeIndex}
              className={clsx(style.theme, {
                [style.themeCurrent]: currentTheme === themeName,
              })}
              onClick={() => {
                dispatch.sessionModel.setTheme(themeName);
              }}
            >
              <div className={style.themeBackground} style={{ background: themeDetails.background }}>
                <div
                  className={style.themeText}
                  style={{ borderColor: `transparent transparent ${themeDetails.primary} transparent` }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      ))}

      <div className={style.themes}>
        <button
          className={clsx(style.theme, {
            [style.themeCurrent]: currentTheme === 'custom',
          })}
          onClick={() => {
            dispatch.sessionModel.setTheme('custom');
          }}
        >
          <div className={style.themeBackground}>
            <div className={style.icon}>
              <Icon icon="PencilIcon" cover stroke />
            </div>
          </div>
        </button>

        {currentTheme === 'custom' && (
          <div className={style.custom}>
            <div className={style.customField}>
              <div className={style.customLabel}>Background:</div>
              <input
                type="color"
                className={style.customInput}
                value={currentColorBackground}
                onChange={(e) => {
                  dispatch.sessionModel.setColorBackground(e.target.value);
                }}
              />
            </div>
            <div className={style.customField}>
              <div className={style.customLabel}>Text:</div>
              <input
                type="color"
                className={style.customInput}
                value={currentColorText}
                onChange={(e) => {
                  dispatch.sessionModel.setColorText(e.target.value);
                }}
              />
            </div>
            <div className={style.customField}>
              <div className={style.customLabel}>Highlight:</div>
              <input
                type="color"
                className={style.customInput}
                value={currentColorPrimary}
                onChange={(e) => {
                  dispatch.sessionModel.setColorPrimary(e.target.value);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

//
// OPTIONS
//

const OptionSettings = () => {
  const dispatch = useDispatch();

  const { optionGridEllipsis, optionGridRatings } = useSelector(({ sessionModel }) => sessionModel);

  const menuItems = [
    { key: 'optionGridEllipsis', label: 'Trim titles to one line in grid view', state: optionGridEllipsis },
    { key: 'optionGridRatings', label: 'Show star ratings in grid view', state: optionGridRatings },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, state }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
            />
            <div>{label}</div>
          </label>
        </div>
      ))}
    </div>
  );
};

//
// MENU
//

const MenuSettings = () => {
  const dispatch = useDispatch();

  const {
    menuShowArtists,
    menuShowAlbums,
    menuShowPlaylists,
    menuShowArtistCollections,
    menuShowAlbumCollections,
    menuShowArtistGenres,
    menuShowAlbumGenres,
    menuShowArtistStyles,
    menuShowAlbumStyles,
    menuShowArtistMoods,
    menuShowAlbumMoods,
    menuShowAllPlaylists,
  } = useSelector(({ sessionModel }) => sessionModel);

  const menuItems = [
    { key: 'menuShowArtists', label: 'Artists', state: menuShowArtists },
    { key: 'menuShowAlbums', label: 'Albums', state: menuShowAlbums },
    { key: 'menuShowPlaylists', label: 'Playlists', state: menuShowPlaylists },
    { key: 'menuShowArtistCollections', label: 'Artist Collections', state: menuShowArtistCollections },
    { key: 'menuShowAlbumCollections', label: 'Album Collections', state: menuShowAlbumCollections },
    { key: 'menuShowArtistGenres', label: 'Artist Genres', state: menuShowArtistGenres },
    { key: 'menuShowAlbumGenres', label: 'Album Genres', state: menuShowAlbumGenres },
    { key: 'menuShowArtistStyles', label: 'Artist Styles', state: menuShowArtistStyles },
    { key: 'menuShowAlbumStyles', label: 'Album Styles', state: menuShowAlbumStyles },
    { key: 'menuShowArtistMoods', label: 'Artist Moods', state: menuShowArtistMoods },
    { key: 'menuShowAlbumMoods', label: 'Album Moods', state: menuShowAlbumMoods },
    { key: 'menuShowAllPlaylists', label: 'All Playlists', state: menuShowAllPlaylists },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, state }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
            />
            <div>{label}</div>
          </label>
        </div>
      ))}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Settings;
