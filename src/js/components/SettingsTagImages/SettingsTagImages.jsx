// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import clsx from 'clsx';

import { SettingsList, ViewGrid } from 'js/components';
import { getEnvironment, validateHttpsUrl, validateLocalPath } from 'js/utils';

import style from './SettingsTagImages.module.scss';

const envData = getEnvironment();
const isLocal = import.meta.env.VITE_ENV === 'local';

const previewTags = [
  //
  'Alternative',
  // 'Blues',
  'Comedy & Spoken',
  'Country',
  'Electronic',
  'Jazz',
  'Metal',
  'Pop',
  'Punk',
  // 'Rap',
  'Rock',
  // 'Warm',
];
const previewEntries = previewTags.map((tag) => ({ tagId: tag, title: tag }));

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsTagImages = () => {
  const tagImageOption = useSelector(({ sessionModel }) => sessionModel.tagImageOption);
  const tagImageCustomType = useSelector(({ sessionModel }) => sessionModel.tagImageCustomType);
  const tagImageCustomUrl = useSelector(({ sessionModel }) => sessionModel.tagImageCustomUrl);
  const tagImageCustomPath = useSelector(({ sessionModel }) => sessionModel.tagImageCustomPath);
  const tagImageCustomExtension = useSelector(({ sessionModel }) => sessionModel.tagImageCustomExtension);

  const optionMenuItems = [
    // {
    //   type: 'label',
    //   label:
    //     'This is an experimental new feature to display images for all music tags. You can use the Chromatix community images, bring your own images, or just keep things as they were.',
    // },
    {
      type: 'radio',
      key: 'tagImageOption',
      label: 'Image source',
      description: 'Choose where tag images are loaded from, or disable them entirely.',
      state: tagImageOption,
      options: [
        { label: 'None', value: 'none' },
        ...(isLocal ? [{ label: 'Local', value: 'local' }] : []),
        { label: 'Chromatix community images', value: 'community' },
        { label: 'Bring your own', value: 'custom' },
      ],
    },
  ];

  const typeMenuItems = [
    {
      type: 'radio',
      key: 'tagImageCustomType',
      label: 'Source',
      state: tagImageCustomType,
      options: [
        { label: 'Hosted online with SSL', value: 'hosted' },
        { label: 'Local folder', value: 'local' },
      ],
    },
  ];

  const urlMenuItems = [
    {
      type: 'text',
      key: 'tagImageCustomUrl',
      label: 'Provide the URL to your image directory',
      footnote: 'e.g. https://your-website.com/images/',
      state: tagImageCustomUrl,
      props: {
        placeholder: 'https://your-website.com/images/',
        error: tagImageCustomUrl ? validateHttpsUrl(tagImageCustomUrl) : null,
      },
    },
  ];

  const pathMenuItems = [
    {
      type: 'text',
      key: 'tagImageCustomPath',
      label: 'Provide the full path to your local folder',
      footnote: 'e.g. /Users/Alex/Documents/Chromatix/images/',
      state: tagImageCustomPath,
      props: {
        placeholder: '/Users/Alex/Documents/Chromatix/images/',
        error: tagImageCustomPath ? validateLocalPath(tagImageCustomPath) : null,
      },
    },
  ];

  const extensionMenuItems = [
    {
      type: 'select',
      key: 'tagImageCustomExtension',
      label: 'Image format',
      description: 'Choose the file extension your own images are saved with.',
      state: tagImageCustomExtension,
      options: [
        { label: '.avif', value: 'avif' },
        { label: '.gif', value: 'gif' },
        { label: '.jpg', value: 'jpg' },
        { label: '.png', value: 'png' },
        { label: '.webp', value: 'webp' },
      ],
    },
  ];

  return (
    <>
      <SettingsList
        title="Options"
        // description="This is an experimental new feature to display images for all music tags. You can use the Chromatix community images, bring your own images, or just keep things as they were."
        menuItems={optionMenuItems}
      />

      {tagImageOption === 'custom' && envData.isElectron && (
        <SettingsList title="Bring Your Own" menuItems={typeMenuItems} />
      )}

      {tagImageOption === 'custom' && tagImageCustomType === 'hosted' && <SettingsList menuItems={urlMenuItems} />}

      {tagImageOption === 'custom' && tagImageCustomType === 'local' && envData.isElectron && (
        <SettingsList menuItems={pathMenuItems} />
      )}

      {tagImageOption === 'custom' && <SettingsList menuItems={extensionMenuItems} />}

      <div className={clsx('settingsGroup', style.settingsGroup)}>
        <div className={clsx(style.title)}>Preview</div>
        <ViewGrid variant="albumTags" entries={previewEntries} />
      </div>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsTagImages;
