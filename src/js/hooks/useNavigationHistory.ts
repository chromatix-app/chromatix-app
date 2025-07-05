import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { analyticsEvent } from 'js/utils';

interface NavigationHistory {
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
}

/**
 * Custom hook that manages navigation history state and provides navigation controls.
 * Tracks forward/backward navigation and maintains history/future stacks for custom navigation.
 * @returns Object with navigation state and control functions
 */

const useNavigationHistory = (): NavigationHistory => {
  const dispatch = useDispatch();
  const history = useHistory();

  const historyLength = useSelector(({ persistentModel }: any) => persistentModel.historyLength);
  const historyStack = useSelector(({ persistentModel }: any) => persistentModel.historyStack);
  const futureStack = useSelector(({ persistentModel }: any) => persistentModel.futureStack);

  const canGoBack = historyStack.length > 0;
  const canGoForward = futureStack.length > 0;

  const goBack = (): void => {
    if (canGoBack) {
      history.goBack();
      analyticsEvent('Navigate Backwards');
    }
  };

  const goForward = (): void => {
    if (canGoForward) {
      history.goForward();
      analyticsEvent('Navigate Forwards');
    }
  };

  useEffect(() => {
    return history.listen((location, action) => {
      // if action is PUSH we are going forwards
      if (action === 'PUSH') {
        // dispatch.persistentModel.setDirection('forwards');
        dispatch.persistentModel.setHistoryLength(historyLength + 1);
        // add the new location to the historyStack
        dispatch.persistentModel.setHistoryStack([...historyStack, location.key]);
        // clear the futureStack because it is not possible to go forward from here
        dispatch.persistentModel.setFutureStack([]);
      }
      // if action is POP we could be going forwards or backwards
      else if (action === 'POP') {
        // determine if we are going forwards or backwards
        if (futureStack.length > 0 && futureStack[futureStack.length - 1] === location.key) {
          // dispatch.persistentModel.setDirection('forwards');
          // if we are going forwards, pop the futureStack and push it onto the historyStack
          const newHistoryStack = [...historyStack, futureStack[futureStack.length - 1]];
          const newFutureStack = futureStack.slice(0, -1);
          dispatch.persistentModel.setHistoryStack(newHistoryStack);
          dispatch.persistentModel.setFutureStack(newFutureStack);
        } else {
          // dispatch.persistentModel.setDirection('backwards');
          // if we are going backwards, pop the historyStack and push it onto the futureStack
          const newFutureStack = [...futureStack, historyStack[historyStack.length - 1]];
          const newHistoryStack = historyStack.slice(0, -1);
          dispatch.persistentModel.setFutureStack(newFutureStack);
          dispatch.persistentModel.setHistoryStack(newHistoryStack);
        }
        dispatch.persistentModel.setHistoryLength(historyStack.length);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, historyLength, historyStack, futureStack]);

  return { canGoBack, canGoForward, goBack, goForward };
};

export default useNavigationHistory;
