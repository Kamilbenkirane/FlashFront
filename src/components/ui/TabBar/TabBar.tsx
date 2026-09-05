import { AppIcon } from '@/components/ui/icons';
import useReducedMotion from '@/hooks/useReducedMotion';
import { theme } from '@/tokens/theme';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import type React from 'react';
import { useContext, useEffect, useState } from 'react';
import {
  Keyboard,
  type LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getTabIcon, tabBarStyles as styles } from './TabBar.styles';
import type { TabBarProps, TabItemProps } from './TabBar.types';

const getBlurTint = (color: string): 'light' | 'dark' => {
  const normalizedColor = color.replace('#', '');
  if (normalizedColor.length !== 6) {
    return 'light';
  }

  const red = Number.parseInt(normalizedColor.slice(0, 2), 16);
  const green = Number.parseInt(normalizedColor.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedColor.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance < 0.45 ? 'dark' : 'light';
};

const TAB_ICON_SIZE = 18;
const TAB_ICON_STROKE_WIDTH = 2.1;

// Individual Tab Item Component
const TabItem: React.FC<TabItemProps> = ({
  route,
  descriptor,
  navigation,
  isFocused,
  onPress,
  onLongPress,
  testID,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const handlePress = () => {
    // Add haptic feedback on iOS
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const iconName = getTabIcon(route.name);
  const label =
    typeof descriptor.options.tabBarLabel === 'string'
      ? descriptor.options.tabBarLabel
      : route.name;
  const accessibilityLabel =
    typeof descriptor.options.tabBarAccessibilityLabel === 'string'
      ? descriptor.options.tabBarAccessibilityLabel
      : `${label} tab`;

  return (
    <MotiPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      containerStyle={styles.tabItemContainer}
      testID={testID}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isFocused }}
      animate={({ hovered, pressed }) => {
        'worklet';
        return {
          scale: prefersReducedMotion ? 1 : pressed ? 0.98 : hovered ? 1.01 : 1,
        };
      }}
    >
      <MotiView
        style={[
          styles.tabItem,
          isFocused ? styles.activeTabItem : styles.inactiveTabItem,
        ]}
        animate={{
          opacity: isFocused ? 1 : 0.88,
        }}
        transition={{
          ...(prefersReducedMotion
            ? { type: 'timing' as const, duration: 0 }
            : {
                type: 'spring' as const,
                damping: 18,
                stiffness: 240,
              }),
        }}
      >
        <View style={styles.tabIconContainer}>
          <AppIcon
            color={
              isFocused ? theme.colors.primary : theme.colors.mutedForeground
            }
            name={iconName}
            size={TAB_ICON_SIZE}
            strokeWidth={TAB_ICON_STROKE_WIDTH}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
          ]}
        >
          {label}
        </Text>
        <MotiView
          style={styles.activeIndicator}
          animate={{
            opacity: isFocused ? 1 : 0,
            scaleX: prefersReducedMotion ? 1 : isFocused ? 1 : 0.6,
          }}
          transition={{
            type: 'timing',
            duration: prefersReducedMotion ? 0 : 180,
          }}
        />
      </MotiView>
    </MotiPressable>
  );
};

// Main TabBar Component
export const TabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
  insets,
  style,
  testID,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key]?.options;
  const shouldHideOnKeyboard = focusedOptions.tabBarHideOnKeyboard ?? false;
  const shouldShowTabBar = !(shouldHideOnKeyboard && isKeyboardVisible);
  const bottomDockSpacing = Math.max(
    insets.bottom - theme.spacing.lg,
    theme.spacing.xs,
  );
  const blurTint = getBlurTint(theme.colors.background);

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(keyboardShowEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleLayout = (event: LayoutChangeEvent) => {
    onHeightChange?.(event.nativeEvent.layout.height);
  };

  return (
    <MotiView
      style={[styles.container, style]}
      onLayout={handleLayout}
      pointerEvents={shouldShowTabBar ? 'auto' : 'none'}
      testID={testID}
      animate={{
        opacity: shouldShowTabBar ? 1 : 0,
        translateY: prefersReducedMotion ? 0 : shouldShowTabBar ? 0 : 120,
      }}
      transition={{
        type: 'timing',
        duration: prefersReducedMotion ? 0 : shouldShowTabBar ? 240 : 180,
      }}
    >
      <View style={[styles.dock, { paddingBottom: bottomDockSpacing }]}>
        <View style={styles.shell}>
          <BlurView
            tint={blurTint}
            intensity={Platform.OS === 'ios' ? 85 : 55}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.shellTint} />
          {state.routes.map((route, index: number) => {
            const descriptor = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                route={route}
                descriptor={descriptor}
                navigation={navigation}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                testID={`tab-${route.name.toLowerCase()}`}
              />
            );
          })}
        </View>
      </View>
    </MotiView>
  );
};
