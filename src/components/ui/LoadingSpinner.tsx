import { ActivityIndicator, View } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'large', fullScreen = false }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size={size} color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color="#3B82F6" />
    </View>
  );
}
