import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FlashcardScreen from '../screens/FlashCardScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { TabBar } from './ui/TabBar';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Flashcard"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false, // We'll handle headers in individual screens
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

export default TabNavigator;
