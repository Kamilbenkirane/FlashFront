import type { OnboardingStackParamList } from '@/app/navigation/types';
import OnboardingScreen from '@/features/onboarding/screens/OnboardingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type React from 'react';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
