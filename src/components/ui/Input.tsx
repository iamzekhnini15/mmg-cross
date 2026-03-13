import { forwardRef, useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, onFocus, onBlur, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error ? 'border-red-500' : isFocused ? 'border-accent' : 'border-border';

  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-sm mb-1.5 font-medium">{label}</Text>
      <TextInput
        ref={ref}
        className={`bg-surface border ${borderClass} rounded-xl px-4 py-3 text-text-primary text-base`}
        placeholderTextColor="#6B7280"
        selectionColor="#3B82F6"
        accessibilityLabel={label}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error ? (
        <Text className="text-red-500 text-xs mt-1" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
