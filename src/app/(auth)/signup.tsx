import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod/v4';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const signupSchema = z
  .object({
    email: z.email('Adresse email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'Confirmez votre mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { signUpWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await signUpWithEmail(data.email, data.password);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-accent text-4xl font-bold mb-4">MMG</Text>
        <Text className="text-text-primary text-xl font-bold mb-2">Compte créé</Text>
        <Text className="text-text-secondary text-center mb-8">
          Vérifiez votre boîte mail pour confirmer votre adresse email, puis connectez-vous.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable accessibilityLabel="Retour à la connexion">
            <Text className="text-accent text-base font-semibold">Retour à la connexion</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-accent text-4xl font-bold">MMG</Text>
          <Text className="text-text-secondary text-base mt-2">ManageMyGarage</Text>
        </View>

        <View className="mb-6">
          <Text className="text-text-primary text-2xl font-bold mb-1">Créer un compte</Text>
          <Text className="text-text-secondary text-sm">
            Inscrivez-vous pour commencer à gérer vos véhicules
          </Text>
        </View>

        {error ? (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm" accessibilityRole="alert">
              {error}
            </Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="email"
          rules={{
            validate: (value) => {
              const result = z.email().safeParse(value);
              return result.success || 'Adresse email invalide';
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="vous@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            validate: (value) => {
              if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
              return true;
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Mot de passe"
              placeholder="Minimum 8 caractères"
              secureTextEntry
              autoComplete="new-password"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{ required: 'Confirmez votre mot de passe' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirmer le mot de passe"
              placeholder="Retapez votre mot de passe"
              secureTextEntry
              autoComplete="new-password"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          accessibilityLabel="Créer un compte"
        >
          Créer un compte
        </Button>

        <View className="flex-row items-center justify-center mt-8">
          <Text className="text-text-secondary text-sm">Déjà un compte ? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityLabel="Se connecter">
              <Text className="text-accent text-sm font-semibold">Se connecter</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
