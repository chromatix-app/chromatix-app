// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Loading, TitleHeading, ViewGrid } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  const [entries, setEntries] = useState(null);

  const tagImageOption = useSelector(({ sessionModel }) => sessionModel.tagImageOption);

  useEffect(() => {
    const tagsUrl = tagImageOption === 'local' ? '/tags/tags.json' : 'https://assets.chromatix.app/data/tags.json';

    fetch(tagsUrl)
      .then((response) => response.json())
      .then((tags) => {
        setEntries([...new Set(tags)].map((tag) => ({ tagId: tag, title: tag })));
      });
  }, [tagImageOption]);

  if (!entries) {
    return <Loading forceVisible inline showOffline />;
  }

  return (
    <ViewGrid variant="albumTags" entries={entries}>
      <TitleHeading title="Tags" subtitle={`${entries.length} tags`} padding={false} />
    </ViewGrid>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
