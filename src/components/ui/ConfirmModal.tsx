import { Modal, Pressable, Text, View } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-black/60 items-center justify-center px-6" onPress={onCancel}>
        <Pressable
          className="bg-surface border border-border rounded-2xl w-full max-w-sm p-5"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-text-primary text-lg font-bold mb-2">{title}</Text>
          <Text className="text-text-secondary text-sm mb-6">{message}</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 bg-surface-light border border-border rounded-xl py-3 items-center"
              accessibilityLabel={cancelLabel}
            >
              <Text className="text-text-primary font-semibold">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="flex-1 bg-red-500 rounded-xl py-3 items-center"
              accessibilityLabel={confirmLabel}
            >
              <Text className="text-white font-semibold">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
