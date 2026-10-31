// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import config from 'js/_config/config';
import { devThemes } from 'js/_config/devThemes';

import {
  Button,
  ActionButton,
  ActionMenu,
  ActionSelect,
  ActionSort,
  ActionToggle,
  ActionWrap,
  FormInput,
  FormOTP,
  FormSelect,
  FormTabButtons,
  FormTabGroup,
  FormTheme,
  Icon,
  PageText,
  PlaybackButton,
  SettingsList,
  TitleHeading,
} from 'js/components';
import { getEnvironment, getLocalStorage, setLocalStorage } from 'js/utils';

// ======================================================================
// OPTIONS
// ======================================================================

const envData = getEnvironment();

const environmentOptions = [
  { value: 'actual', label: 'Actual environment' },
  { value: 'web-mac', label: 'Web / macOS' },
  { value: 'web-win', label: 'Web / Windows' },
  { value: 'web-lin', label: 'Web / Linux' },
  { value: 'electron-mac', label: 'Electron / macOS' },
  { value: 'electron-win', label: 'Electron / Windows' },
  { value: 'electron-lin', label: 'Electron / Linux' },
];

// each inner array is one row of buttons
const devToastRows = [
  [
    { label: 'Standard', title: 'Toast title', description: 'Toast description text.' },
    { label: 'Title Only', title: 'Toast title only' },
    {
      label: 'Long',
      title: 'A much longer toast title that might wrap onto two lines',
      description:
        'A longer description to check wrapping and spacing. Lorem ipsum dolor sit amet consectetur adipiscing elit.',
    },
  ],
  [
    {
      label: 'Persistent',
      title: 'Persistent toast',
      description: 'Stays until dismissed, for checking styles.',
      duration: Infinity,
    },
    { label: 'Debug', title: 'Debug toast', description: 'Not shown in production builds.', debug: true },
  ],
];

const devThemeToSession = ({ theme, background, primary, text, tinting }) =>
  theme
    ? { currentTheme: theme }
    : {
        currentTheme: 'custom',
        currentColorBackground: background,
        currentColorPrimary: primary,
        currentColorText: text,
        currentUiTinting: tinting,
      };

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  const dispatch = useDispatch();

  const devSettingsCheck1 = useSelector(({ sessionModel }) => sessionModel.devSettingsCheck1);
  const devSettingsCheck2 = useSelector(({ sessionModel }) => sessionModel.devSettingsCheck2);
  const devSettingsCheck3 = useSelector(({ sessionModel }) => sessionModel.devSettingsCheck3);
  const devSettingsTabGroup1 = useSelector(({ sessionModel }) => sessionModel.devSettingsTabGroup1);
  const devSettingsTabGroup2 = useSelector(({ sessionModel }) => sessionModel.devSettingsTabGroup2);
  const devSettingsTabGroup3 = useSelector(({ sessionModel }) => sessionModel.devSettingsTabGroup3);
  const devSettingsRadio = useSelector(({ sessionModel }) => sessionModel.devSettingsRadio);
  const devSettingsRange = useSelector(({ sessionModel }) => sessionModel.devSettingsRange);
  const devSettingsText = useSelector(({ sessionModel }) => sessionModel.devSettingsText);
  const devSettingsSelect = useSelector(({ sessionModel }) => sessionModel.devSettingsSelect);

  const themeKeyFocus = useSelector(({ sessionModel }) => sessionModel.themeKeyFocus);
  const currentContrast = useSelector(({ sessionModel }) => sessionModel.currentContrast);

  // the active dev theme is whichever one matches every session field it would set
  const activeDevTheme = useSelector(
    ({ sessionModel }) =>
      devThemes.find((devTheme) =>
        Object.entries(devThemeToSession(devTheme)).every(
          ([key, value]) => String(sessionModel[key]).toLowerCase() === value.toLowerCase()
        )
      )?.label
  );

  const [environment] = useState(() => getLocalStorage(config.storageDevEnvironmentKey) || 'actual');
  const [loggedInAttr, setLoggedInAttr] = useState(
    () => document.documentElement.getAttribute('data-logged-in') === 'true'
  );

  // environment is read once at startup, so a reload is needed to apply a change
  const handleEnvironmentChange = (value) => {
    setLocalStorage(config.storageDevEnvironmentKey, value);
    window.location.reload();
  };

  // only flips the html attribute (not the real login state), so it resets whenever login state changes
  const handleLoggedInChange = (value) => {
    document.documentElement.setAttribute('data-logged-in', value);
    setLoggedInAttr(value);
  };

  const [view, setView] = useState('grid');
  const [tabView, setTabView] = useState('grid');
  const [tabGroup, setTabGroup] = useState('grid');
  const [otp, setOtp] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [sort, setSort] = useState('title');
  const [order, setOrder] = useState('asc');
  const [colOptions, setColOptions] = useState({
    country: true,
    genre: true,
    userRating: true,
    isFavourite: false,
  });

  const handleColChange = (attr, value) => {
    setColOptions((prev) => ({ ...prev, [attr]: value }));
  };

  return (
    <>
      <TitleHeading title="Components" />
      <PageText fontSize="small" wysiwyg={true}>
        {/* ENVIRONMENT */}

        <div>
          <h2>Environment</h2>
          <FormSelect
            value={envData.isRealElectron ? 'actual' : environment}
            onChange={handleEnvironmentChange}
            options={environmentOptions}
            disabled={envData.isRealElectron}
          />
          <p>
            Electron: <strong>{envData.isElectron ? 'Yes' : 'No'}</strong>, Platform:{' '}
            <strong>{envData.electronPlatformName || 'Web'}</strong>, OS: <strong>{envData.osName}</strong>
            {envData.isRealElectron ? ' (simulation not available in the Electron app)' : ''}
            {!envData.isRealElectron && environment !== 'actual' ? ' (simulated)' : ''}
          </p>
          <div className="mt-35"></div>
          <SettingsList
            padding={false}
            menuItems={[
              {
                type: 'checkbox',
                key: 'devLoggedInAttr',
                label: 'Display as logged in',
                description: 'Only toggles the html attribute, so resets whenever the real login state changes.',
                state: loggedInAttr,
                onChange: handleLoggedInChange,
              },
              {
                type: 'checkbox',
                key: 'themeKeyFocus',
                label: 'Highlight focused elements',
                description: 'Displays a visual highlight on focused elements when using keyboard navigation.',
                state: themeKeyFocus,
              },
              {
                type: 'spacer',
              },
              {
                type: 'radio',
                key: 'currentContrast',
                label: 'Contrast',
                state: currentContrast,
                options: [
                  { label: 'Default', value: 'default' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                ],
              },
              {
                type: 'spacer',
              },
              {
                type: 'radio',
                key: 'devTheme',
                label: 'Theme',
                description: 'Edit the devThemes list in js/_config/devThemes.ts to change these.',
                state: activeDevTheme,
                options: devThemes.map(({ label }) => ({ label, value: label })),
                onChange: (label) =>
                  dispatch.sessionModel.setSessionState(
                    devThemeToSession(devThemes.find((devTheme) => devTheme.label === label))
                  ),
              },
            ]}
          />
        </div>

        {/* TOASTS */}

        <div>
          <h2>Toasts</h2>
          {devToastRows.map((row, index) => (
            <div key={index} className="devButtons">
              {row.map(({ label, ...notification }) => (
                <Button
                  key={label}
                  wrap={false}
                  size="tiny"
                  color="onPrimary"
                  onClick={() => dispatch.appModel.addNotification(notification)}
                >
                  {label}
                </Button>
              ))}
            </div>
          ))}
        </div>

        {/* ACTIONS - STANDARD */}

        <div>
          <h2>Actions - Standard</h2>
          <ActionWrap>
            <ActionToggle
              value={view}
              options={[
                { value: 'grid', label: 'Grid view' },
                { value: 'list', label: 'List view' },
              ]}
              setter={setView}
              icon={view === 'grid' ? 'GridIcon' : 'ListIcon'}
            />
            <ActionSort
              sortValue={sort}
              orderValue={order}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'userRating', label: 'Rating' },
              ]}
              setSort={setSort}
              setOrder={setOrder}
            />
            <ActionSelect
              value={sort}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'userRating', label: 'Rating' },
              ]}
              setter={setSort}
            />
            <ActionMenu
              label="Options"
              icon="CogIcon"
              setter={handleColChange}
              entries={[
                { variant: 'checkbox', label: 'Country', attr: 'country', checked: colOptions.country },
                { variant: 'checkbox', label: 'Genre', attr: 'genre', checked: colOptions.genre },
                { variant: 'checkbox', label: 'Rating', attr: 'userRating', checked: colOptions.userRating },
                { variant: 'checkbox', label: 'Favourite', attr: 'isFavourite', checked: colOptions.isFavourite },
                {
                  variant: 'checkbox',
                  label: 'Disabled (checked)',
                  attr: 'devDisabledOn',
                  checked: true,
                  disabled: true,
                },
                { variant: 'checkbox', label: 'Disabled', attr: 'devDisabledOff', checked: false, disabled: true },
              ]}
            />
            <ActionButton label="New playlist" icon="PlusIcon" onClick={() => {}} />
            <ActionMenu
              label="More"
              icon="EllipsisCircleIcon"
              entries={[
                { variant: 'sectionHeading', label: 'Section heading' },
                {
                  variant: 'submenu',
                  label: 'Add to playlist',
                  icon: 'PlusCircleIcon',
                  getEntries: () => [
                    { variant: 'action', label: 'Chill Vibes', onSelect: () => {} },
                    { variant: 'action', label: 'Workout Mix', onSelect: () => {} },
                    { variant: 'action', label: 'Road Trip', onSelect: () => {} },
                  ],
                },
                { variant: 'action', label: 'Remove from playlist', icon: 'MinusCircleIcon', onSelect: () => {} },
                { variant: 'divider' },
                { variant: 'action', label: 'Add to queue', icon: 'QueueBeforeIcon', onSelect: () => {} },
                { variant: 'divider' },
                { variant: 'action', label: 'Play track', icon: 'PlayIcon', onSelect: () => {} },
                { variant: 'action', label: 'Go to artist', icon: 'PeopleIcon', onSelect: () => {} },
                { variant: 'action', label: 'Go to album', icon: 'PlayCircleIcon', onSelect: () => {} },
                { variant: 'action', label: 'Disabled', icon: 'MinusCircleIcon', onSelect: () => {}, disabled: true },
              ]}
            />
          </ActionWrap>
        </div>

        {/* ACTIONS - ICON */}

        <div>
          <h2>Actions - Icon</h2>
          <div>
            <ActionToggle
              variant="Large"
              value={view}
              options={[
                { value: 'grid', label: 'Grid view' },
                { value: 'list', label: 'List view' },
              ]}
              setter={setView}
              icon={view === 'grid' ? 'GridIcon' : 'ListIcon'}
            />
            <ActionSort
              variant="Large"
              sortValue={sort}
              orderValue={order}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'userRating', label: 'Rating' },
              ]}
              setSort={setSort}
              setOrder={setOrder}
            />
            <ActionSelect
              variant="Large"
              value={sort}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'userRating', label: 'Rating' },
              ]}
              setter={setSort}
            />
            <ActionMenu
              variant="Large"
              label="Options"
              icon="CogIcon"
              setter={handleColChange}
              entries={[
                { variant: 'checkbox', label: 'Country', attr: 'country', checked: colOptions.country },
                { variant: 'checkbox', label: 'Genre', attr: 'genre', checked: colOptions.genre },
                { variant: 'checkbox', label: 'Rating', attr: 'userRating', checked: colOptions.userRating },
                { variant: 'checkbox', label: 'Favourite', attr: 'isFavourite', checked: colOptions.isFavourite },
                {
                  variant: 'checkbox',
                  label: 'Disabled (checked)',
                  attr: 'devDisabledOn',
                  checked: true,
                  disabled: true,
                },
                { variant: 'checkbox', label: 'Disabled', attr: 'devDisabledOff', checked: false, disabled: true },
              ]}
            />
            <ActionButton variant="Large" label="New playlist" icon="PlusIcon" onClick={() => {}} />
            <ActionMenu
              variant="Large"
              label="More"
              icon="EllipsisIcon"
              entries={[
                { variant: 'sectionHeading', label: 'Section heading' },
                {
                  variant: 'submenu',
                  label: 'Add to playlist',
                  icon: 'PlusCircleIcon',
                  getEntries: () => [
                    { variant: 'action', label: 'Chill Vibes', onSelect: () => {} },
                    { variant: 'action', label: 'Workout Mix', onSelect: () => {} },
                    { variant: 'action', label: 'Road Trip', onSelect: () => {} },
                  ],
                },
                { variant: 'action', label: 'Remove from playlist', icon: 'MinusCircleIcon', onSelect: () => {} },
                { variant: 'divider' },
                { variant: 'action', label: 'Add to queue', icon: 'QueueBeforeIcon', onSelect: () => {} },
                { variant: 'divider' },
                { variant: 'action', label: 'Play track', icon: 'PlayIcon', onSelect: () => {} },
                { variant: 'action', label: 'Go to artist', icon: 'PeopleIcon', onSelect: () => {} },
                { variant: 'action', label: 'Go to album', icon: 'PlayCircleIcon', onSelect: () => {} },
                { variant: 'action', label: 'Disabled', icon: 'MinusCircleIcon', onSelect: () => {}, disabled: true },
              ]}
            />
          </div>
        </div>

        {/* PLAYBACK BUTTONS */}

        <div>
          <h2>Playback Buttons</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <PlaybackButton onClick={() => {}} />
            <PlaybackButton isPlaying onClick={() => {}} />
            <PlaybackButton isLoaded onClick={() => {}} />
            <PlaybackButton variant="shuffle" onClick={() => {}} />
          </div>
        </div>

        {/* FORM - THEME SELECTOR */}

        <div>
          <h2>Form - Theme Selector</h2>
          <FormTheme themeKey="currentTheme" />
        </div>

        {/* FORM - SELECT */}

        <div>
          <h2>Form - Select</h2>
          <FormSelect
            value={selectValue}
            onChange={setSelectValue}
            placeholder="Choose an option"
            options={[
              { value: 'option1', label: 'Option 1' },
              {
                value: 'option2',
                label: 'Option 2 with much longer text that might even go onto multiple lines',
              },
              { value: 'option3', label: 'Option 3' },
              {
                value: 'option4',
                label: 'Option 4',
                disabled: true,
              },
            ]}
          />
          <br />
          <FormSelect
            value=""
            onChange={() => {}}
            placeholder="Choose an option"
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ]}
            disabled
          />
        </div>

        {/* FORM - TEXT INPUT */}

        <div>
          <h2>Form - Text Input</h2>
          <FormInput value={inputValue} onChange={setInputValue} placeholder="Placeholder text" />
          <br />
          <FormInput
            value={inputValue}
            onChange={setInputValue}
            placeholder="Placeholder text"
            error="This is an example error message."
          />
          <br />
          <FormInput value="" onChange={() => {}} placeholder="Disabled" disabled />
          <br />
          <FormInput
            value={inputValue}
            onChange={setInputValue}
            placeholder="Color: primary (default)"
            color="primary"
          />
          <br />
          <FormInput value={inputValue} onChange={setInputValue} placeholder="Color: secondary" color="secondary" />
          <br />
          <FormInput value={inputValue} onChange={setInputValue} placeholder="Size: default (default)" size="default" />
          <br />
          <FormInput value={inputValue} onChange={setInputValue} placeholder="Size: large" size="large" />
          <br />
          <FormInput
            value={inputValue}
            onChange={setInputValue}
            placeholder="Size: large, color: secondary (modal style)"
            size="large"
            color="secondary"
          />
        </div>

        {/* FORM - OTP */}

        <div>
          <h2>Form - OTP</h2>
          <br />
          <FormOTP value={otp} onChange={setOtp} />
        </div>

        {/* FORM - TAB BUTTONS */}

        <div>
          <h2>Form - Tab Buttons</h2>
          <FormTabButtons
            tabs={[
              {
                label: 'Grid view',
                icon: <Icon icon="GridIcon" cover strokeAndFill />,
                onClick: () => setTabView('grid'),
                active: tabView === 'grid',
              },
              {
                label: 'List view',
                icon: <Icon icon="ListIcon" cover stroke />,
                onClick: () => setTabView('list'),
                active: tabView === 'list',
              },
              {
                label: 'Track view',
                icon: <Icon icon="MusicNoteSingleIcon" cover stroke />,
                onClick: () => setTabView('track'),
                active: tabView === 'track',
              },
              {
                label: 'Disabled',
                icon: <Icon icon="VanishedCircleIcon" cover stroke />,
                active: false,
                disabled: true,
                renderDisabled: false,
              },
            ]}
          />
        </div>

        {/* FORM - TAB GROUP */}

        <div>
          <h2>Form - Tab Group</h2>
          <FormTabGroup
            name="tabGroup"
            value={tabGroup}
            onChange={setTabGroup}
            options={[
              { value: 'grid', label: 'Grid view', icon: <Icon icon="GridIcon" cover strokeAndFill /> },
              { value: 'list', label: 'List view', icon: <Icon icon="ListIcon" cover stroke /> },
              { value: 'track', label: 'Track view', icon: <Icon icon="MusicNoteSingleIcon" cover stroke /> },
              {
                value: 'disabled',
                label: 'Disabled',
                disabled: true,
                icon: <Icon icon="VanishedCircleIcon" cover stroke />,
              },
            ]}
          />
        </div>

        {/* SETTINGS LIST */}

        <div>
          <h2>Settings List</h2>
          <SettingsList
            title="Section Title"
            description="Optional section description shown below the title. Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed sed ligula non elit facilisis pretium eu ut mi. Aenean blandit enim sit amet velit lacinia."
            padding={false}
            menuItems={[
              {
                type: 'label',
                label: 'Label item',
              },
              {
                type: 'label',
                label: 'Label item lorem ipsum dolor sit amet consectetur adipiscing elit',
              },
              {
                type: 'label',
                label: 'Label item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
              },
              {
                type: 'label',
                label: 'Label item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description:
                  'Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed sed ligula non elit facilisis pretium eu ut mi. Aenean blandit enim sit amet velit lacinia, eget luctus nisi semper. Nam ut rhoncus eros, ac iaculis purus. Morbi ornare vestibulum neque vel sodales. Maecenas mattis id lacus ut finibus.',
              },
              {
                type: 'spacer',
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck1',
                label: 'Checkbox item lorem ipsum dolor sit amet consectetur adipiscing elit',
                state: devSettingsCheck1,
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck2',
                label: 'Checkbox item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsCheck2,
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck3',
                label: 'Checkbox item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description:
                  'Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed sed ligula non elit facilisis pretium eu ut mi. Aenean blandit enim sit amet velit lacinia, eget luctus nisi semper. Nam ut rhoncus eros, ac iaculis purus. Morbi ornare vestibulum neque vel sodales. Maecenas mattis id lacus ut finibus.',
                state: devSettingsCheck3,
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck1Disabled',
                label: 'Checkbox item (disabled)',
                description: 'This option is currently unavailable.',
                state: false,
                disabled: true,
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck1Disabled',
                label: 'Checkbox item (disabled)',
                description: 'This option is currently unavailable.',
                state: true,
                disabled: true,
              },
              {
                type: 'spacer',
              },
              {
                type: 'radio',
                key: 'devSettingsRadio',
                label: 'Radio item',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsRadio,
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2 lorem ipsum dolor sit amet consectetur adipiscing elit' },
                  {
                    value: 'option3',
                    label:
                      'Option 3 lorem ipsum dolor sit amet consectetur adipiscing elit. Sed sed ligula non elit facilisis pretium eu ut mi. Aenean blandit enim sit amet velit lacinia, eget luctus nisi semper. Nam ut rhoncus eros, ac iaculis purus. Morbi ornare vestibulum neque vel sodales. Maecenas mattis id lacus ut finibus.',
                  },
                  {
                    value: 'option4',
                    label: 'Option 4 lorem ipsum dolor sit amet consectetur adipiscing elit',
                    disabled: true,
                  },
                ],
              },
              {
                type: 'spacer',
              },
              {
                type: 'range',
                key: 'devSettingsRange',
                label: 'Range slider item',
                state: devSettingsRange,
                props: {
                  min: 1,
                  max: 5,
                  handleChange: (val) => dispatch.sessionModel.setSessionState({ devSettingsRange: val }),
                },
              },
              {
                type: 'range',
                key: 'devSettingsRange',
                label: 'Range slider item lorem ipsum dolor sit amet consectetur adipiscing elit',
                state: devSettingsRange,
                props: {
                  min: 1,
                  max: 5,
                  handleChange: (val) => dispatch.sessionModel.setSessionState({ devSettingsRange: val }),
                },
              },
              {
                type: 'range',
                key: 'devSettingsRange',
                label: 'Range slider item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description:
                  'Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed sed ligula non elit facilisis pretium eu ut mi. Aenean blandit enim sit amet velit lacinia, eget luctus nisi semper. Nam ut rhoncus eros, ac iaculis purus. Morbi ornare vestibulum neque vel sodales. Maecenas mattis id lacus ut finibus.',
                state: devSettingsRange,
                props: {
                  min: 1,
                  max: 5,
                  handleChange: (val) => dispatch.sessionModel.setSessionState({ devSettingsRange: val }),
                },
              },
              {
                type: 'range',
                key: 'devSettingsRange',
                label: 'Range slider item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description: 'This option is currently unavailable.',
                state: devSettingsRange,
                disabled: true,
                props: {
                  min: 1,
                  max: 5,
                  handleChange: (val) => dispatch.sessionModel.setSessionState({ devSettingsRange: val }),
                },
              },
              {
                type: 'spacer',
              },
              {
                type: 'tabGroup',
                key: 'devSettingsTabGroup1',
                label: 'Tab group item',
                state: devSettingsTabGroup1,
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ],
              },
              {
                type: 'tabGroup',
                key: 'devSettingsTabGroup2',
                label: 'Tab group item',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsTabGroup2,
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3', disabled: true },
                ],
              },
              {
                type: 'tabGroup',
                key: 'devSettingsTabGroup3',
                label: 'Tab group item',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsTabGroup3,
                disabled: true,
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ],
              },
              {
                type: 'spacer',
              },
              {
                type: 'select',
                key: 'devSettingsSelect',
                label: 'Select item',
                state: devSettingsSelect,
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3', disabled: true },
                ],
              },
              {
                type: 'select',
                key: 'devSettingsSelect',
                label: 'Select item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsSelect,
                props: {
                  placeholder: 'Choose an option',
                },
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3', disabled: true },
                ],
              },
              {
                type: 'select',
                key: 'devSettingsSelect',
                label: 'Select item (disabled)',
                description: 'This option is currently unavailable.',
                state: devSettingsSelect,
                disabled: true,
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                ],
              },
              {
                type: 'spacer',
              },
              {
                type: 'text',
                key: 'devSettingsText',
                label: 'Text input item',
                state: devSettingsText,
                props: {
                  placeholder: 'Placeholder text',
                },
              },
              {
                type: 'text',
                key: 'devSettingsText',
                label: 'Text input item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsText,
                props: {
                  placeholder: 'Placeholder text',
                },
              },
              {
                type: 'text',
                key: 'devSettingsText',
                label: 'Text input item (with error)',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsText,
                props: {
                  placeholder: 'Placeholder text',
                  error: 'This is an example error message.',
                },
              },
              {
                type: 'text',
                key: 'devSettingsText',
                label: 'Text input item (disabled)',
                description: 'This option is currently unavailable.',
                state: devSettingsText,
                disabled: true,
                props: {
                  placeholder: 'Placeholder text',
                },
              },
            ]}
          />
        </div>

        {/* BUTTONS */}

        <div>
          <h2>Buttons</h2>

          <div className="devButtons">
            <Button wrap={false} size="large">
              Large (Default)
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="medium">
              Medium
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="small">
              Small
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny">
              Tiny
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tab">
              Tab
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny">
              Core
            </Button>
            <Button wrap={false} size="tiny" loading>
              Core Loading
            </Button>
            <Button wrap={false} size="tiny" disabled renderDisabled={false}>
              Disabled Text
            </Button>
            <Button wrap={false} size="tiny" disabled>
              Disabled All
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="mono">
              Mono
            </Button>
            <Button wrap={false} size="tiny" color="mono" loading>
              Mono Loading
            </Button>
            <Button wrap={false} size="tiny" color="mono" disabled renderDisabled={false}>
              Disabled Text
            </Button>
            <Button wrap={false} size="tiny" color="mono" disabled>
              Disabled All
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="onPrimary">
              On Primary
            </Button>
            <Button wrap={false} size="tiny" color="onPrimary" loading>
              On Primary Loading
            </Button>
            <Button wrap={false} size="tiny" color="onPrimary" disabled renderDisabled={false}>
              Disabled Text
            </Button>
            <Button wrap={false} size="tiny" color="onPrimary" disabled>
              Disabled All
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="onSecondary">
              On Secondary
            </Button>
            <Button wrap={false} size="tiny" color="onSecondary" loading>
              On Secondary Loading
            </Button>
            <Button wrap={false} size="tiny" color="onSecondary" disabled renderDisabled={false}>
              Disabled Text
            </Button>
            <Button wrap={false} size="tiny" color="onSecondary" disabled>
              Disabled All
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="outlineOnPrimary">
              Outline On Primary
            </Button>
            <Button wrap={false} size="tiny" color="outlineOnPrimary" loading>
              Outline Loading
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="outlineOnSecondary">
              Outline On Secondary
            </Button>
            <Button wrap={false} size="tiny" color="outlineOnSecondary" loading>
              Outline Loading
            </Button>
          </div>
        </div>

        {/* CARDS */}

        <div>
          <h2>Cards</h2>
          <div className="devCards">
            <div className="devCard">Card</div>
            <div className="devCardGhost">Ghost card (hover)</div>
          </div>
        </div>
      </PageText>

      {/* SECONDARY SURFACE */}

      <PageText color="secondary" fontSize="small" fullWidth={true} wysiwyg={true}>
        <div>
          <h2>Secondary Surface</h2>
          <div className="devButtons">
            <Button wrap={false} size="tiny" color="onSecondary">
              On Secondary
            </Button>
            <Button wrap={false} size="tiny" color="onSecondary" loading>
              On Secondary Loading
            </Button>
            <Button wrap={false} size="tiny" color="onSecondary" disabled renderDisabled={false}>
              Disabled Text
            </Button>
            <Button wrap={false} size="tiny" color="onSecondary" disabled>
              Disabled All
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="outlineOnSecondary">
              Outline On Secondary
            </Button>
            <Button wrap={false} size="tiny" color="outlineOnSecondary" loading>
              Outline Loading
            </Button>
          </div>

          <br />
          <FormInput value={inputValue} onChange={setInputValue} placeholder="Placeholder text" color="secondary" />
          <br />
          <FormInput value="Filled text" onChange={() => {}} color="secondary" />
          <br />
          <FormInput value="" onChange={() => {}} placeholder="Disabled" color="secondary" disabled />
          <br />

          <div className="devCards">
            <div className="devCardGhost devCardGhostOnSecondary">Ghost card (hover)</div>
          </div>
        </div>
      </PageText>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
