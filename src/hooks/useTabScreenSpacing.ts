import { theme } from '@/tokens/theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';

const useTabScreenSpacing = (extraBottomPadding = 0) => {
  const tabBarHeight = useBottomTabBarHeight();

  const bottomSpacing = useMemo(
    () => tabBarHeight + theme.spacing.sm + extraBottomPadding,
    [extraBottomPadding, tabBarHeight, theme.spacing.sm],
  );

  const scrollContentContainerStyle = useMemo(
    () => ({ paddingBottom: bottomSpacing }),
    [bottomSpacing],
  );

  const scrollIndicatorInsets = useMemo(
    () => ({ bottom: bottomSpacing }),
    [bottomSpacing],
  );

  const viewportOffsetStyle = useMemo(
    () => ({ marginBottom: bottomSpacing }),
    [bottomSpacing],
  );

  return {
    bottomSpacing,
    scrollContentContainerStyle,
    scrollIndicatorInsets,
    viewportOffsetStyle,
    tabBarHeight,
  };
};

export default useTabScreenSpacing;
