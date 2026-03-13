import { Text, View } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-light',
  success: 'bg-green-500/20',
  warning: 'bg-orange-500/20',
  error: 'bg-red-500/20',
  info: 'bg-blue-500/20',
};

const variantTextClasses: Record<BadgeVariant, string> = {
  default: 'text-text-secondary',
  success: 'text-green-400',
  warning: 'text-orange-400',
  error: 'text-red-400',
  info: 'text-blue-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 rounded-md',
  md: 'px-3 py-1 rounded-lg',
};

const sizeTextClasses: Record<BadgeSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
};

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  return (
    <View className={`self-start ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      <Text className={`font-medium ${variantTextClasses[variant]} ${sizeTextClasses[size]}`}>
        {children}
      </Text>
    </View>
  );
}
