// ======================================================================
// IMPORTS
// ======================================================================

import { forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as RadixSelect from '@radix-ui/react-select';

import { themes } from 'js/_config/themes';
import { Icon } from 'js/components';

import style from './FormTheme.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const FormTheme = ({ themeKey = 'currentTheme', groups }) => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(({ sessionModel }) => sessionModel[themeKey]);

  const activeTheme = themes[currentTheme];
  const displayName = activeTheme ? activeTheme.label : 'Custom theme';

  const handleChange = (value) => {
    dispatch.sessionModel.setTheme(value);
  };

  const visibleGroups = groups
    ? Object.entries(groupedThemes).filter(([groupName]) => groups.includes(groupName))
    : Object.entries(groupedThemes);

  return (
    <RadixSelect.Root value={currentTheme} onValueChange={handleChange}>
      <RadixSelect.Trigger className={style.trigger} aria-label="Select theme">
        <span className={style.triggerSwatch}>
          <ThemeSwatch themeDetails={activeTheme} />
        </span>
        <span className={style.triggerLabel}>{displayName}</span>
        <span className={style.triggerChevron}>
          <Icon icon="ArrowDownIcon" cover stroke strokeWidth={1.5} />
        </span>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content position="popper" sideOffset={4} className={style.content}>
          <RadixSelect.Viewport className={style.viewport}>
            {visibleGroups.map(([groupName, groupThemes], groupIndex) => (
              <RadixSelect.Group key={groupIndex}>
                <RadixSelect.Label className={style.groupLabel}>{groupName}</RadixSelect.Label>
                {groupThemes.map(({ themeName, themeDetails }) => (
                  <ThemeSelectItem key={themeName} value={themeName} themeDetails={themeDetails} />
                ))}
              </RadixSelect.Group>
            ))}
            <RadixSelect.Group>
              <RadixSelect.Label className={style.groupLabel}>Custom</RadixSelect.Label>
              <ThemeSelectItem value="custom" label="Custom theme" />
            </RadixSelect.Group>
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

const ThemeSelectItem = forwardRef(({ value, themeDetails, label, ...props }, ref) => {
  return (
    <RadixSelect.Item className={style.item} value={value} ref={ref} {...props}>
      <span className={style.itemSwatch}>
        <ThemeSwatch themeDetails={themeDetails} />
      </span>
      <RadixSelect.ItemText>{formatItemLabel(label ?? themeDetails?.label)}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className={style.itemIndicator}>
        <Icon icon="CheckCircleFilledIcon" cover />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});

const ThemeSwatch = ({ themeDetails }) =>
  themeDetails ? (
    <>
      <span className={style.swatchBg} style={{ background: themeDetails.background }} />
      <span
        className={style.swatchTriangle}
        style={{ borderColor: `transparent transparent ${themeDetails.primary} transparent` }}
      />
    </>
  ) : (
    <span className={style.swatchIcon}>
      <Icon icon="PencilIcon" cover stroke />
    </span>
  );

// ======================================================================
// UTILITIES
// ======================================================================

const formatItemLabel = (label) => {
  if (!label) return null;
  const slashIndex = label.indexOf('/');
  if (slashIndex === -1) return label;
  return (
    <>
      <span className={style.itemLabelPrefix}>{label.slice(0, slashIndex + 1)}</span>
      {label.slice(slashIndex + 1)}
    </>
  );
};

const groupedThemes = Object.entries(themes).reduce((groups, [themeName, themeDetails]) => {
  const group = themeDetails.group;
  if (group) {
    if (!groups[group]) groups[group] = [];
    groups[group].push({ themeName, themeDetails });
  }
  return groups;
}, {});

// ======================================================================
// EXPORT
// ======================================================================

export default FormTheme;
