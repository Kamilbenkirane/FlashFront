import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Google's "G" mark in its brand colors, as required by their sign-in guidelines. */
const GoogleMark = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    <Path
      d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z"
      fill="#4285F4"
    />
    <Path
      d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z"
      fill="#FBBC05"
    />
    <Path
      d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z"
      fill="#EB4335"
    />
  </Svg>
);

/** "or" divider plus the Google button; errors surface through `authError`. */
export const GoogleSignInOption: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePress = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Typography variant="caption" color="muted">
          or
        </Typography>
        <View style={styles.dividerLine} />
      </View>
      <Button
        title="Continue with Google"
        variant="outline"
        size="lg"
        icon={<GoogleMark size={20} />}
        onPress={() => void handlePress()}
        loading={isSubmitting}
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },
});
