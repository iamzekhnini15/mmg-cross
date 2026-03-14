import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from './Button';

interface ResultAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface ResultModalProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  actions: ResultAction[];
  onClose: () => void;
}

const ICON_CONFIG = {
  success: {
    name: 'checkmark-circle' as const,
    color: '#22C55E',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/20',
  },
  error: {
    name: 'close-circle' as const,
    color: '#EF4444',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/20',
  },
};

export function ResultModal({ visible, type, title, message, actions, onClose }: ResultModalProps) {
  const icon = ICON_CONFIG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center px-6"
        onPress={onClose}
        accessibilityLabel="Fermer"
      >
        <Pressable
          className="bg-surface w-full max-w-sm rounded-2xl border border-border overflow-hidden"
          onPress={() => {}}
          accessibilityRole="alert"
        >
          {/* Icon */}
          <View className="items-center pt-8 pb-4">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center ${icon.bgClass} border ${icon.borderClass}`}
            >
              <Ionicons name={icon.name} size={36} color={icon.color} />
            </View>
          </View>

          {/* Text */}
          <View className="px-6 pb-6 items-center">
            <Text className="text-text-primary text-xl font-bold text-center mb-2">{title}</Text>
            <Text className="text-text-muted text-sm text-center leading-5">{message}</Text>
          </View>

          {/* Actions */}
          <View className="px-6 pb-6 gap-3">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? 'primary'}
                onPress={action.onPress}
                accessibilityLabel={action.label}
              >
                {action.label}
              </Button>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
