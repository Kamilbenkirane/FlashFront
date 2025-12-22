import type React from 'react';
import { View } from 'react-native';
import { triggerHaptic } from '../../../utils/haptics';
import { Button } from '../Button';
import type { ActionButtonsProps } from './ActionButtons.types';

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onForgotten,
  onRemembered,
  onKnown,
  disabled = false,
  loading = false,
  className = '',
  testID,
}) => {
  const handleForgotten = () => {
    if (!disabled && !loading) {
      triggerHaptic('impact');
      onForgotten();
    }
  };

  const handleRemembered = () => {
    if (!disabled && !loading) {
      triggerHaptic('impact');
      onRemembered();
    }
  };

  const handleKnown = () => {
    if (!disabled && !loading) {
      triggerHaptic('impact');
      onKnown();
    }
  };

  return (
    <View
      className={`flex-row justify-around items-center px-6 py-4 gap-2 ${className}`}
      testID={testID}
    >
      <Button
        title="Forgotten"
        variant="error"
        size="lg"
        onPress={handleForgotten}
        disabled={disabled}
        loading={loading}
        className="flex-1 max-w-[120px]"
        testID={`${testID}-forgotten`}
      />

      <Button
        title="Known"
        variant="warning"
        size="lg"
        onPress={handleKnown}
        disabled={disabled}
        loading={loading}
        className="rounded-full aspect-square max-w-[80px] flex-none"
        testID={`${testID}-known`}
      />

      <Button
        title="Remembered"
        variant="success"
        size="lg"
        onPress={handleRemembered}
        disabled={disabled}
        loading={loading}
        className="flex-1 max-w-[120px]"
        testID={`${testID}-remembered`}
      />
    </View>
  );
};
