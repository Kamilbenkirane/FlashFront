import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { createTabBarStyles, getTabIcon } from './TabBar.styles';
import type { TabBarProps, TabItemProps } from './TabBar.types';

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
  const { theme, isDark } = useTheme();
  const styles = createTabBarStyles(isDark);
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const opacityAnimation = useRef(
    new Animated.Value(isFocused ? 1 : 0.7),
  ).current;

  // Animate when tab focus changes
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: isFocused ? 1.1 : 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(opacityAnimation, {
        toValue: isFocused ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const handlePress = () => {
    // Add haptic feedback on iOS
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const icon = getTabIcon(route.name);
  const label = descriptor.options.tabBarLabel || route.name;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={[styles.tabItem, isFocused && styles.activeTabItem]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.tabIconContainer,
          {
            transform: [{ scale: scaleAnimation }],
            opacity: opacityAnimation,
          },
        ]}
      >
        <Text
          style={[
            styles.tabIcon,
            isFocused ? styles.activeTabIcon : styles.inactiveTabIcon,
          ]}
        >
          {icon}
        </Text>
        {isFocused && <View style={styles.activeBadge} />}
      </Animated.View>

      <Text
        style={[
          styles.tabLabel,
          isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// Main TabBar Component
export const TabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createTabBarStyles(isDark);
  const insets = useSafeAreaInsets();

  const handleQuickStudyPress = () => {
    // Add haptic feedback
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Navigate to study screen if not already there
    if (state.index !== 0) {
      // Assuming study is first tab
      navigation.navigate('Flashcard');
    }
  };

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom + 8 }, style]}
      testID={testID}
    >
      {state.routes.map((route, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress' as any,
            target: route.key,
            canPreventDefault: true,
          } as any) as { defaultPrevented: boolean };

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress' as any,
            target: route.key,
          } as any);
        };

        return (
          <TabItem
            key={route.key}
            route={route}
            descriptor={descriptors[route.key]}
            navigation={navigation}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            testID={`tab-${route.name.toLowerCase()}`}
          />
        );
      })}

      {/* Floating Action Button for Quick Study */}
      <Pressable
        style={styles.floatingActionButton}
        onPress={handleQuickStudyPress}
        testID="quick-study-fab"
      >
        <Text style={styles.fabIcon}>⚡</Text>
      </Pressable>
    </View>
  );
};
