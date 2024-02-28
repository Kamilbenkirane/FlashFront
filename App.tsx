import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import TabNavigator from './src/components/TabNavigator';
import { UserProvider } from './src/context/UserContext';

const App = () => {
  console.log('Starting App');
  return (
    <UserProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
