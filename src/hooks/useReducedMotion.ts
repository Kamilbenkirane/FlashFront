import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

const useReducedMotion = () => {
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isMounted) {
        setReducedMotionEnabled(isEnabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        setReducedMotionEnabled(isEnabled);
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reducedMotionEnabled;
};

export default useReducedMotion;
