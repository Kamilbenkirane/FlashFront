import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FlashcardScreen from '../screens/FlashCardScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Import your ProfileScreen
import LibraryScreen from '../screens/LibraryScreen'; // Import your LibraryScreen

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="Flashcard">
      <Tab.Screen name="Flashcard" component={FlashcardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
