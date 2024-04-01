import { useState, useEffect } from 'react';

const useNearTop = (ref, offset) => {
  const [isNearTop, setIsNearTop] = useState(false);

  useEffect(() => {
    const checkIfNearTop = () => {
      const rect = ref.current.getBoundingClientRect();
      setIsNearTop(rect.top <= offset);
    };

    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.addEventListener('scroll', checkIfNearTop);
      checkIfNearTop();

      return () => {
        contentDiv.removeEventListener('scroll', checkIfNearTop);
      };
    }
  }, [ref, offset]);

  return isNearTop;
};

export default useNearTop;
