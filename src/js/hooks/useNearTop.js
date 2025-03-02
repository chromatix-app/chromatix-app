import { useState, useEffect } from 'react';

const useNearTop = (ref, offset) => {
  const [isNearTop, setIsNearTop] = useState(false);

  useEffect(() => {
    const checkIfNearTop = () => {
      const rect = ref.current?.getBoundingClientRect();
      setIsNearTop(!rect || rect.top <= offset);
    };

    const contentElement = document.getElementById('content');
    const scrollableElement = document.getElementById('scrollable');
    const actualElement = scrollableElement || contentElement;

    if (actualElement) {
      actualElement.addEventListener('scroll', checkIfNearTop);
      checkIfNearTop();

      return () => {
        actualElement.removeEventListener('scroll', checkIfNearTop);
      };
    }
  }, [ref, offset]);

  return isNearTop;
};

export default useNearTop;
