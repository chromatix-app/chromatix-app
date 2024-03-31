import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const useNavigationHistory = () => {
  const history = useHistory();

  const [length, setLength] = useState(0);
  // const [direction, setDirection] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const [futureStack, setFutureStack] = useState([]);

  const canGoBack = historyStack.length > 0;
  const canGoForward = futureStack.length > 0;

  // console.log(length, direction);
  // console.log(historyStack);
  // console.log(futureStack);

  const goBack = () => {
    if (canGoBack) {
      history.goBack();
    }
  };

  const goForward = () => {
    if (canGoForward) {
      history.goForward();
    }
  };

  useEffect(() => {
    return history.listen((location, action) => {
      // if action is PUSH we are going forwards
      if (action === 'PUSH') {
        // setDirection('forwards');
        setLength(length + 1);
        // add the new location to the historyStack
        setHistoryStack([...historyStack, location.pathname]);
        // clear the futureStack because it is not possible to go forward from here
        setFutureStack([]);
      }
      // if action is POP we could be going forwards or backwards
      else if (action === 'POP') {
        // determine if we are going forwards or backwards
        if (futureStack.length > 0 && futureStack[futureStack.length - 1] === location.pathname) {
          // setDirection('forwards');
          // if we are going forwards, pop the futureStack and push it onto the historyStack
          setHistoryStack([...historyStack, futureStack.pop()]);
          setFutureStack(futureStack);
        } else {
          // setDirection('backwards');
          // if we are going backwards, pop the historyStack and push it onto the futureStack
          setFutureStack([...futureStack, historyStack.pop()]);
          setHistoryStack(historyStack);
        }
        setLength(historyStack.length);
      }
    });
  }, [history, length, historyStack, futureStack]);

  return { canGoBack, canGoForward, goBack, goForward };
};

export default useNavigationHistory;
