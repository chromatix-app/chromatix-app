// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  FilterButton,
  FilterMenu,
  FilterSelect,
  FilterToggle,
  FormOTP,
  FormTabButtons,
  FormTabGroup,
  FormTheme,
  Icon,
  PageText,
  SettingsList,
  TitleHeading,
} from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  const dispatch = useDispatch();
  const devSettingsCheck = useSelector(({ sessionModel }) => sessionModel.devSettingsCheck);
  const devSettingsTabGroup = useSelector(({ sessionModel }) => sessionModel.devSettingsTabGroup);
  const devSettingsRadio = useSelector(({ sessionModel }) => sessionModel.devSettingsRadio);
  const devSettingsRange = useSelector(({ sessionModel }) => sessionModel.devSettingsRange);

  const [view, setView] = useState('grid');
  const [tabView, setTabView] = useState('grid');
  const [tabGroup, setTabGroup] = useState('grid');
  const [otp, setOtp] = useState('');
  const [sort, setSort] = useState('title');
  const [order, setOrder] = useState('asc');
  const [colOptions, setColOptions] = useState({
    country: true,
    genre: true,
    userRating: true,
    isFavourite: true,
  });

  const handleColChange = (attr, value) => {
    setColOptions((prev) => ({ ...prev, [attr]: value }));
  };

  return (
    <>
      <TitleHeading title="Components" />
      <PageText fontSize="small" wysiwyg={true}>
        {/* FILTERS - STANDARD */}

        <div>
          <h2>Filters - Standard</h2>
          <div>
            <FilterToggle
              value={view}
              options={[
                { value: 'grid', label: 'Grid view' },
                { value: 'list', label: 'List view' },
              ]}
              setter={setView}
              icon={view === 'grid' ? 'GridIcon' : 'ListIcon'}
            />
            <FilterSelect
              value={sort}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'userRating', label: 'Rating' },
              ]}
              setter={setSort}
            />
            <FilterToggle
              value={order}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrder}
              icon={order === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
            <FilterMenu
              label="Options"
              icon="CogIcon"
              setter={handleColChange}
              entries={[
                { label: 'Country', attr: 'country', checked: colOptions.country },
                { label: 'Genre', attr: 'genre', checked: colOptions.genre },
                { label: 'Rating', attr: 'userRating', checked: colOptions.userRating },
                { label: 'Favourite', attr: 'isFavourite', checked: colOptions.isFavourite },
              ]}
            />
            <FilterButton label="New playlist" icon="PlusIcon" onClick={() => {}} />
          </div>
        </div>

        {/* FILTERS - ICON */}

        <div>
          <h2>Filters - Icon</h2>
          <div>
            <FilterToggle
              variant="Large"
              value={view}
              options={[
                { value: 'grid', label: 'Grid view' },
                { value: 'list', label: 'List view' },
              ]}
              setter={setView}
              icon={view === 'grid' ? 'GridIcon' : 'ListIcon'}
            />
            <FilterSelect
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
            <FilterToggle
              variant="Large"
              value={order}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrder}
              icon={order === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
            <FilterMenu
              variant="Large"
              label="Options"
              icon="CogIcon"
              setter={handleColChange}
              entries={[
                { label: 'Country', attr: 'country', checked: colOptions.country },
                { label: 'Genre', attr: 'genre', checked: colOptions.genre },
                { label: 'Rating', attr: 'userRating', checked: colOptions.userRating },
                { label: 'Favourite', attr: 'isFavourite', checked: colOptions.isFavourite },
              ]}
            />
            <FilterButton variant="Large" label="New playlist" icon="PlusIcon" onClick={() => {}} />
          </div>
        </div>

        {/* FORM - THEME SELECTOR */}

        <div>
          <h2>Form - Theme Selector</h2>
          <FormTheme themeKey="currentTheme" />
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
                label: 'Mixed',
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
              { value: 'mixed', label: 'Mixed', disabled: true, icon: <Icon icon="VanishedCircleIcon" cover stroke /> },
            ]}
          />
        </div>

        {/* FORM - OTP */}

        <div>
          <h2>Form - OTP</h2>
          <br />
          <FormOTP value={otp} onChange={setOtp} />
        </div>
        {/* SETTINGS LIST */}

        <div>
          <h2>Settings List</h2>
          <SettingsList
            title="Section Title"
            description="Optional section description shown below the title. Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed sed ligula non elit facilisis pretium eu ut mi. Aenean blandit enim sit amet velit lacinia."
            padded={false}
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
                description:
                  'Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed sed ligula non elit facilisis pretium eu ut mi. Aenean blandit enim sit amet velit lacinia, eget luctus nisi semper. Nam ut rhoncus eros, ac iaculis purus. Morbi ornare vestibulum neque vel sodales. Maecenas mattis id lacus ut finibus.',
              },
              {
                type: 'spacer',
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck',
                label: 'Checkbox item',
                state: devSettingsCheck,
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck',
                label: 'Checkbox item lorem ipsum dolor sit amet consectetur adipiscing elit',
                state: devSettingsCheck,
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck',
                label: 'Checkbox item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsCheck,
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheck',
                label: 'Checkbox item lorem ipsum dolor sit amet consectetur adipiscing elit',
                description:
                  'Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed sed ligula non elit facilisis pretium eu ut mi. Aenean blandit enim sit amet velit lacinia, eget luctus nisi semper. Nam ut rhoncus eros, ac iaculis purus. Morbi ornare vestibulum neque vel sodales. Maecenas mattis id lacus ut finibus.',
                state: devSettingsCheck,
              },
              {
                type: 'checkbox',
                key: 'devSettingsCheckDisabled',
                label: 'Checkbox item (disabled)',
                description: 'This option is currently unavailable.',
                state: false,
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
                type: 'spacer',
              },
              {
                type: 'tabGroup',
                key: 'devSettingsTabGroup',
                label: 'Tab group item',
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
                state: devSettingsTabGroup,
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ],
              },
            ]}
          />
        </div>

        {/* BUTTONS */}

        <div>
          <h2>Buttons</h2>
          <Button size="large">Large (Default)</Button>
          <br />
          <Button size="medium">Medium</Button>
          <br />
          <Button size="small">Small</Button>
          <br />
          <Button size="tiny">Tiny</Button>
          <br />
          <Button size="tab">Tab</Button>
          <br />
          <Button size="tiny" loading>
            Loading
          </Button>
          <br />
          <Button size="tiny" color="mono">
            Mono
          </Button>
          <br />
          <Button size="tiny" color="mono" loading>
            Mono Loading
          </Button>
          <br />
          <Button size="tiny" color="secondary">
            Secondary
          </Button>
          <br />
          <Button size="tiny" color="secondary" loading>
            Secondary Loading
          </Button>
          <br />
          <Button size="tiny" color="tertiary">
            Tertiary
          </Button>
          <br />
          <Button size="tiny" color="tertiary" loading>
            Tertiary Loading
          </Button>
          <br />
          <Button size="tiny" color="outlineSecondary">
            Outline Secondary
          </Button>
          <br />
          <Button size="tiny" color="outlineTertiary">
            Outline Tertiary
          </Button>
          <br />
          <Button size="tiny" disabled>
            Disabled
          </Button>
        </div>
      </PageText>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
