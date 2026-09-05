import type {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type AuthCheckEmailMode = 'verify' | 'reset';

export interface CheckEmailRouteParams {
  mode?: AuthCheckEmailMode;
  message?: string;
}

export interface FlashcardRouteParams {
  selectedDeckId?: string | number;
  selectedDeckName?: string;
  autoStart?: boolean;
}

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { message?: string } | undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  CheckEmail: CheckEmailRouteParams | undefined;
  ResetPassword: undefined;
};

export type OnboardingStackParamList = {
  Onboarding: undefined;
};

export type AppTabParamList = {
  Flashcard: FlashcardRouteParams | undefined;
  Library: undefined;
  Profile: undefined;
};

export type AuthStackScreenProps<RouteName extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, RouteName>;

export type AuthStackNavigationProp<
  RouteName extends keyof AuthStackParamList,
> = NativeStackNavigationProp<AuthStackParamList, RouteName>;

export type AppTabScreenProps<RouteName extends keyof AppTabParamList> =
  BottomTabScreenProps<AppTabParamList, RouteName>;

export type AppTabNavigationProp<RouteName extends keyof AppTabParamList> =
  BottomTabNavigationProp<AppTabParamList, RouteName>;
