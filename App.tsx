import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import FlashcardScreen from "./src/screens/FlashCardScreen";


const Stack = createStackNavigator();

const App = () => {
    console.log("Starting App");
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Flashcard">
                <Stack.Screen name="Flashcard" component={FlashcardScreen} />
                {/* Define other screens here */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
