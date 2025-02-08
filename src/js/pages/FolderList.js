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
  const { folderId = 'root' } = useParams();

  const {
    viewFolders,
    sortFolders,
    orderFolders,

    setViewFolders,
    setSortFolders,
    setOrderFolders,

    sortedFolders,
    folderOrder,
  } = useGetFolderItems(folderId);

  return (
    <>
      <TitleHeading
        key={'folder-' + folderId}
        title="Folders"
        subtitle={
          sortedFolders ? sortedFolders?.length + ' Item' + (sortedFolders?.length !== 1 ? 's' : '') : <>&nbsp;</>
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
      {!sortedFolders && <Loading forceVisible inline showOffline />}
      {sortedFolders && viewFolders === 'grid' && (
        <ListCards
          variant="folders"
          folderId={folderId}
          entries={sortedFolders}
          playingOrder={folderOrder}
          sortKey={sortFolders}
        />
      )}
      {sortFolders && viewFolders === 'list' && (
        <ListTable
          variant={'folders'}
          folderId={folderId}
          entries={sortedFolders}
          playingOrder={folderOrder}
          sortKey={sortFolders}
          orderKey={orderFolders}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FolderList;
