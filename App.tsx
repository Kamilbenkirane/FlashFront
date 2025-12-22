import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import React, { type ReactNode, type ErrorInfo } from 'react';
import { Text, View } from 'react-native';
import 'react-native-gesture-handler';
import TabNavigator from './src/components/TabNavigator';
import { AchievementProvider } from './src/context/AchievementContext';
import { AnalyticsProvider } from './src/context/AnalyticsContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { UserProvider } from './src/context/UserContext';

// Error Boundary Component with proper TypeScript types
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('🔥 APP CRASH DETECTED:', error);
    console.error('🔥 ERROR INFO:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            App Error
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 10 }}>
            Something went wrong. Check the console for details.
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 12, color: 'red' }}>
            {this.state.error?.toString()}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <AchievementProvider>
            <AnalyticsProvider>
              <NavigationContainer>
                <TabNavigator />
              </NavigationContainer>
            </AnalyticsProvider>
          </AchievementProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
