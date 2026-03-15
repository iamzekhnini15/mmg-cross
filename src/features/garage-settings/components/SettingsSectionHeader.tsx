import { Text } from 'react-native';

interface SettingsSectionHeaderProps {
  title: string;
}

export function SettingsSectionHeader({ title }: SettingsSectionHeaderProps) {
  return (
    <Text className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-2 mt-6 px-1">
      {title}
    </Text>
  );
}
