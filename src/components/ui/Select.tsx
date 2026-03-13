import { useState, useCallback } from 'react';
import { Text, View, Pressable, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const borderClass = error ? 'border-red-500' : 'border-border';

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange],
  );

  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-sm mb-1.5 font-medium">{label}</Text>
      <Pressable
        className={`bg-surface border ${borderClass} rounded-xl px-4 py-3 flex-row items-center justify-between`}
        onPress={() => setIsOpen(true)}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityHint="Ouvrir la liste de sélection"
      >
        <Text
          className={selectedOption ? 'text-text-primary text-base' : 'text-text-muted text-base'}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </Pressable>
      {error ? (
        <Text className="text-red-500 text-xs mt-1" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setIsOpen(false)}
          accessibilityLabel="Fermer la sélection"
        >
          <Pressable
            className="bg-surface rounded-t-3xl max-h-[60%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>
            <Text className="text-text-primary text-lg font-semibold px-5 pb-3">{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  className={`px-5 py-3.5 flex-row items-center justify-between ${
                    item.value === value ? 'bg-accent/10' : ''
                  }`}
                  onPress={() => handleSelect(item.value)}
                  accessibilityLabel={item.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: item.value === value }}
                >
                  <Text
                    className={`text-base ${
                      item.value === value ? 'text-accent font-semibold' : 'text-text-primary'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {item.value === value ? (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  ) : null}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View className="h-px bg-border mx-5" />}
            />
            <View className="h-8" />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
