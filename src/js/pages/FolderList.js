// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTable, Loading, TitleHeading } from 'js/components';
import { useGetFolderItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const FolderList = () => {
  const { folderId } = useParams();
  const {
    viewFolders,
    sortFolders,
    orderFolders,

    setViewFolders,
    setSortFolders,
    setOrderFolders,

    sortedFolders,
  } = useGetFolderItems(folderId);

  // const hasTracks = sortedFolders?.filter((entry) => entry.trackId);

  return (
    <>
      <TitleHeading
        title="Folders"
        subtitle={
          sortedFolders ? sortedFolders?.length + ' Folder' + (sortedFolders?.length !== 1 ? 's' : '') : <>&nbsp;</>
        }
      />
      <FilterWrap>
        <FilterToggle
          value={viewFolders}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewFolders}
          icon={viewFolders === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewFolders === 'grid' && (
          <>
            <FilterSelect
              value={sortFolders}
              options={[
                { value: 'sortOrder', label: 'Default' },
                { value: 'title', label: 'Title' },
                { value: 'kind', label: 'Kind' },
              ]}
              setter={setSortFolders}
            />
            <FilterToggle
              value={orderFolders}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderFolders}
              icon={orderFolders === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedFolders && <Loading forceVisible inline />}
      {sortedFolders && viewFolders === 'grid' && <ListCards variant="folders" entries={sortedFolders} />}
      {sortFolders && viewFolders === 'list' && (
        <ListTable variant={'folders'} entries={sortedFolders} sortKey={sortFolders} orderKey={orderFolders} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FolderList;
