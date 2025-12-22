import type React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types';

const baseClasses =
  'flex flex-row items-center justify-center rounded-lg shadow-sm';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 min-h-[32px]',
  md: 'px-6 py-4 min-h-[44px]',
  lg: 'px-8 py-6 min-h-[52px]',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-transparent border border-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  ghost: 'bg-transparent',
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary-500',
  success: 'text-white',
  warning: 'text-white',
  error: 'text-white',
  ghost: 'text-primary-500',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-lg font-semibold',
};

const disabledClasses = 'bg-neutral-200 border-neutral-200 opacity-50';
const disabledTextClasses = 'text-neutral-400';

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  textClassName = '',
  testID,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const getSpinnerColor = () => {
    if (disabled) return '#94a3b8'; // neutral-400
    if (variant === 'secondary' || variant === 'ghost') {
      return '#3b82f6'; // primary-500
    }
    return '#ffffff';
  };

  const buttonClassName = `${baseClasses} ${sizeClasses[size]} ${
    disabled ? disabledClasses : variantClasses[variant]
  } ${fullWidth ? 'w-full' : ''} ${className}`.trim();

  const textClasses = `${textSizeClasses[size]} ${
    disabled ? disabledTextClasses : textVariantClasses[variant]
  } ${textClassName}`.trim();

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex items-center justify-center">
          <ActivityIndicator size="small" color={getSpinnerColor()} />
        </View>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <View className="mr-2">{icon}</View>
        )}
        <Text className={textClasses}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <View className="ml-2">{icon}</View>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      className={buttonClassName}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};
