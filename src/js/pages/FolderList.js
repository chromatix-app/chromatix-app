// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllFolders } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const FolderList = () => {
  const dispatch = useDispatch();

  const { viewFolders, sortFolders, orderFolders, sortedFolders } = useGetAllFolders();

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
          setter={(viewFolders) => {
            dispatch.sessionModel.setSessionState({
              viewFolders,
            });
          }}
          icon={viewFolders === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewFolders === 'grid' && (
          <>
            <FilterToggle
              value={orderFolders}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={(orderFolders) => {
                dispatch.sessionModel.setSessionState({
                  orderFolders,
                });
              }}
              icon={orderFolders === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedFolders && <Loading forceVisible inline />}
      {sortedFolders && viewFolders === 'grid' && <ListCards variant="folders" entries={sortedFolders} />}
      {sortFolders && viewFolders === 'list' && (
        <ListEntries variant="folders" entries={sortedFolders} sortKey={sortFolders} orderKey={orderFolders} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FolderList;
