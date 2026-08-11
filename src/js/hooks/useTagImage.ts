import { useCallback, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import { getEnvironment, slugifyTagName } from 'js/utils';

const envData = getEnvironment();

const communityImageBase = 'https://assets.chromatix.app/assets/tags/community/';
const localImageBase = '/tags/community/';

/**
 * Resolves the tag thumbnail image URL for a card/row/heading that would otherwise fall back to an icon.
 * Reads `tagImageOption` (and its related `tagImageCustom*` fields) from session state - see
 * `SettingsTagImages` for how these are set. Falls back to null (letting the caller render its icon instead)
 * once the image fails to load, or when `hasIcon` is false.
 *
 * This is called once per card/row in views with potentially hundreds of entries (e.g. `ViewGrid`, `ViewList`),
 * so it's written to bail out and touch session state as cheaply as possible when tag images aren't applicable.
 * @param title - Tag name used to build the image filename
 * @param hasIcon - Whether the caller would otherwise render an icon in this slot
 * @returns A tuple of the tag image URL (or null if disabled, inapplicable, or failed to load) and an `onError`
 * handler to pass to the `<img>` tag, which falls back to the icon once called
 */

const useTagImage = (title: string | null | undefined, hasIcon: boolean): [string | null, () => void] => {
  const isApplicable = hasIcon && !!title;

  // single selector call (rather than one per field) to minimise store subscriptions across hundreds of rows -
  // shallowEqual avoids a "returned a different result" warning/rerender from the new object literal each call
  const tagImageSettings = useSelector(
    ({ sessionModel }: any) =>
      isApplicable
        ? {
            tagImageOption: sessionModel.tagImageOption,
            tagImageCustomType: sessionModel.tagImageCustomType,
            tagImageCustomUrl: sessionModel.tagImageCustomUrl,
            tagImageCustomPath: sessionModel.tagImageCustomPath,
            tagImageCustomExtension: sessionModel.tagImageCustomExtension,
          }
        : null,
    shallowEqual
  );

  let tagImageSrc: string | null = null;

  if (isApplicable && tagImageSettings && tagImageSettings.tagImageOption !== 'none') {
    const { tagImageOption, tagImageCustomType, tagImageCustomUrl, tagImageCustomPath, tagImageCustomExtension } =
      tagImageSettings;

    if (tagImageOption === 'local') {
      tagImageSrc = `${localImageBase}${slugifyTagName(title as string)}.jpg`;
    } else if (tagImageOption === 'community') {
      tagImageSrc = `${communityImageBase}${slugifyTagName(title as string)}.jpg`;
    } else if (tagImageOption === 'custom' && tagImageCustomType === 'hosted' && tagImageCustomUrl) {
      tagImageSrc = `${tagImageCustomUrl}${slugifyTagName(title as string)}.${tagImageCustomExtension}`;
    } else if (
      tagImageOption === 'custom' &&
      tagImageCustomType === 'local' &&
      tagImageCustomPath &&
      envData.isElectron
    ) {
      tagImageSrc = `chromatix://local/${encodeURIComponent(tagImageCustomPath + slugifyTagName(title as string) + '.' + tagImageCustomExtension)}`;
    }
  }

  // tracks which URL (if any) has failed to load, so editing the settings that produced it - e.g. typing a new
  // custom base URL - gives the new candidate URL a fresh chance to load instead of staying stuck on the icon
  const [failedTagImageSrc, setFailedTagImageSrc] = useState<string | null>(null);
  const handleTagImageError = useCallback(() => setFailedTagImageSrc(tagImageSrc), [tagImageSrc]);

  if (tagImageSrc && tagImageSrc === failedTagImageSrc) {
    tagImageSrc = null;
  }

  return [tagImageSrc, handleTagImageError];
};

export default useTagImage;
