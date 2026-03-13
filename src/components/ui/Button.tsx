import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: string;
  style?: ViewStyle;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent active:bg-accent-dark',
  secondary: 'bg-surface-light active:bg-surface border border-border',
  destructive: 'bg-red-600 active:bg-red-700',
  ghost: 'bg-transparent active:bg-surface-light',
};

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-text-primary',
  destructive: 'text-white',
  ghost: 'text-accent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-5 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-xl',
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    accessibilityLabel,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      ref={ref}
      className={`flex-row items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'opacity-50' : ''}`}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' ? '#3B82F6' : '#FFFFFF'}
          className="mr-2"
        />
      ) : null}
      <Text className={`font-semibold ${variantTextClasses[variant]} ${sizeTextClasses[size]}`}>
        {children}
      </Text>
    </Pressable>
  );
});
