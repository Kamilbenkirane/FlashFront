import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import type React from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

interface ReviewActionsTriggerProps {
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ReviewActionsTrigger: React.FC<ReviewActionsTriggerProps> = ({
  disabled = false,
  onPress,
  style,
}) => {
  return (
    <View style={style}>
      <Pressable
        onPress={() => {
          if (!disabled) {
            onPress();
          }
        }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          disabled ? styles.triggerDisabled : undefined,
          pressed && !disabled ? styles.triggerPressed : undefined,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open manual review actions"
        accessibilityHint="Shows buttons for forgotten, known, and remembered."
        accessibilityState={{ disabled }}
      >
        <Typography variant="small" style={styles.triggerText}>
          Use buttons
        </Typography>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerPressed: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  triggerText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.medium,
    textAlign: 'center',
  },
});
