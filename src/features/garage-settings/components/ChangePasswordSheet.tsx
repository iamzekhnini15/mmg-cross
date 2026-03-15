import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { useChangePassword } from '@/features/garage-settings/hooks/useChangePassword';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/features/garage-settings/schemas/changePasswordForm';
import { zodResolver } from '@hookform/resolvers/zod';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Controller, useForm } from 'react-hook-form';

export const ChangePasswordSheet = forwardRef<BottomSheet>(function ChangePasswordSheet(_, ref) {
  const changePassword = useChangePassword();
  const [success, setSuccess] = useState(false);

  const snapPoints = useMemo(() => ['55%'], []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleClose = useCallback(() => {
    reset();
    setSuccess(false);
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
  }, [ref, reset]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync(data.newPassword);
      setSuccess(true);
      setTimeout(handleClose, 1500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
    }
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={() => {
        reset();
        setSuccess(false);
      }}
      backgroundStyle={{ backgroundColor: '#1A1A1B' }}
      handleIndicatorStyle={{ backgroundColor: '#6B7280' }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-text-primary text-xl font-bold mb-2">Changer le mot de passe</Text>
        <Text className="text-text-muted text-sm mb-6">
          Entrez votre nouveau mot de passe ci-dessous.
        </Text>

        {success ? (
          <View className="items-center py-6">
            <Text className="text-green-500 text-base font-semibold">
              Mot de passe modifie avec succes !
            </Text>
          </View>
        ) : (
          <View>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nouveau mot de passe"
                  placeholder="Minimum 8 caracteres"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.newPassword?.message}
                  autoCapitalize="none"
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirmer le mot de passe"
                  placeholder="Retapez le mot de passe"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  autoCapitalize="none"
                />
              )}
            />
            <Button onPress={handleSubmit(onSubmit)} loading={changePassword.isPending}>
              Modifier le mot de passe
            </Button>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
