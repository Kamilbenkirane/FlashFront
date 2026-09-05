import type { AuthStackParamList } from '@/app/navigation/types';
import CheckEmailScreen from '@/features/auth/screens/CheckEmailScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgotPasswordScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import ResetPasswordScreen from '@/features/auth/screens/ResetPasswordScreen';
import SignupScreen from '@/features/auth/screens/SignupScreen';
import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type React from 'react';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  initialRouteName?: keyof AuthStackParamList;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({
  initialRouteName = 'Welcome',
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
