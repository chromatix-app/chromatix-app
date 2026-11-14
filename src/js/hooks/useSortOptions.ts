import { useMemo } from 'react';
import { useSelector } from 'react-redux';

type SortOptions = {
  sortNumbersFirst: boolean;
  ignoreLeadingArticles: boolean;
  useSortTitle: boolean;
};

/**
 * Returns the user's sort settings, ready to spread into `sortList`. The object only changes when
 * a setting does, so it's safe to use in hook dependency lists.
 */

function useSortOptions(): SortOptions {
  const sortNumbersFirst = useSelector(({ sessionModel }: any) => sessionModel.optionSortNumbersFirst);
  const ignoreLeadingArticles = useSelector(({ sessionModel }: any) => sessionModel.optionSortIgnoreLeadingArticles);
  const useSortTitle = useSelector(({ sessionModel }: any) => sessionModel.optionUseSortTitle);

  return useMemo(
    () => ({ sortNumbersFirst, ignoreLeadingArticles, useSortTitle }),
    [sortNumbersFirst, ignoreLeadingArticles, useSortTitle]
  );
}

export default useSortOptions;
