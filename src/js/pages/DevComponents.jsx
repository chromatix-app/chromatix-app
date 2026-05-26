// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';

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
  TitleHeading,
} from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
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
              { value: 'mixed', label: 'Mixed' },
            ]}
          />
        </div>

        {/* FORM - OTP */}

        <div>
          <h2>Form - OTP</h2>
          <br />
          <FormOTP value={otp} onChange={setOtp} />
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
