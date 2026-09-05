import type { AppTabParamList } from '@/app/navigation/types';
import { TabBar } from '@/components/ui/TabBar';
import LibraryScreen from '@/features/library/screens/LibraryScreen';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import FlashcardScreen from '@/features/study/screens/FlashCardScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Flashcard"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Flashcard"
        component={FlashcardScreen}
        options={{
          tabBarLabel: 'Study',
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
