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
  FilterWrap,
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

  const devSettingsCheck1 = useSelector(({ sessionModel }) => sessionModel.devSettingsCheck1);
  const devSettingsCheck2 = useSelector(({ sessionModel }) => sessionModel.devSettingsCheck2);
  const devSettingsCheck3 = useSelector(({ sessionModel }) => sessionModel.devSettingsCheck3);
  const devSettingsTabGroup1 = useSelector(({ sessionModel }) => sessionModel.devSettingsTabGroup1);
  const devSettingsTabGroup2 = useSelector(({ sessionModel }) => sessionModel.devSettingsTabGroup2);
  const devSettingsTabGroup3 = useSelector(({ sessionModel }) => sessionModel.devSettingsTabGroup3);
  const devSettingsRadio = useSelector(({ sessionModel }) => sessionModel.devSettingsRadio);
  const devSettingsRange = useSelector(({ sessionModel }) => sessionModel.devSettingsRange);

  const themeKeyFocus = useSelector(({ sessionModel }) => sessionModel.themeKeyFocus);

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
          <FilterWrap>
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
                { variant: 'checkbox', label: 'Country', attr: 'country', checked: colOptions.country },
                { variant: 'checkbox', label: 'Genre', attr: 'genre', checked: colOptions.genre },
                { variant: 'checkbox', label: 'Rating', attr: 'userRating', checked: colOptions.userRating },
                { variant: 'checkbox', label: 'Favourite', attr: 'isFavourite', checked: colOptions.isFavourite },
              ]}
            />
            <FilterButton label="New playlist" icon="PlusIcon" onClick={() => {}} />
          </FilterWrap>
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
                { variant: 'checkbox', label: 'Country', attr: 'country', checked: colOptions.country },
                { variant: 'checkbox', label: 'Genre', attr: 'genre', checked: colOptions.genre },
                { variant: 'checkbox', label: 'Rating', attr: 'userRating', checked: colOptions.userRating },
                { variant: 'checkbox', label: 'Favourite', attr: 'isFavourite', checked: colOptions.isFavourite },
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
                key: 'themeKeyFocus',
                label: 'Highlight focused elements',
                state: themeKeyFocus,
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
                description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
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
            <Button
              wrap={false}
              size="tab"
              onClick={() =>
                // toggle the data-logged-in attribute on the html element between true and false
                document.documentElement.setAttribute(
                  'data-logged-in',
                  document.documentElement.getAttribute('data-logged-in') === 'true' ? 'false' : 'true'
                )
              }
            >
              Toggle Logged In
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny">
              Primary
            </Button>
            <Button wrap={false} size="tiny" loading>
              Primary Loading
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
            <Button wrap={false} size="tiny" color="secondary">
              Secondary
            </Button>
            <Button wrap={false} size="tiny" color="secondary" loading>
              Secondary Loading
            </Button>
            <Button wrap={false} size="tiny" color="secondary" disabled renderDisabled={false}>
              Disabled Text
            </Button>
            <Button wrap={false} size="tiny" color="secondary" disabled>
              Disabled All
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="tertiary">
              Tertiary
            </Button>
            <Button wrap={false} size="tiny" color="tertiary" loading>
              Tertiary Loading
            </Button>
            <Button wrap={false} size="tiny" color="tertiary" disabled renderDisabled={false}>
              Disabled Text
            </Button>
            <Button wrap={false} size="tiny" color="tertiary" disabled>
              Disabled All
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="outlineSecondary">
              Secondary Outline
            </Button>
            <Button wrap={false} size="tiny" color="outlineSecondary" loading>
              Secondary Loading
            </Button>
          </div>

          <div className="devButtons">
            <Button wrap={false} size="tiny" color="outlineTertiary">
              Tertiary Outline
            </Button>
            <Button wrap={false} size="tiny" color="outlineTertiary" loading>
              Tertiary Loading
            </Button>
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
