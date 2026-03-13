import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod/v4';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loginSchema = z.object({
  email: z.email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signInWithEmail, signInWithGoogle, signInWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmail(data.email, data.password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion Google';
      setError(message);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setOauthLoading('apple');
    setError(null);
    try {
      await signInWithApple();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion Apple';
      setError(message);
    } finally {
      setOauthLoading(null);
    }
  };

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
          <Text className="text-text-primary text-2xl font-bold mb-1">Connexion</Text>
          <Text className="text-text-secondary text-sm">
            Connectez-vous pour accéder à votre espace
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
          rules={{ required: 'Mot de passe requis' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Mot de passe"
              placeholder="Votre mot de passe"
              secureTextEntry
              autoComplete="password"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={!!oauthLoading}
          accessibilityLabel="Se connecter"
        >
          Se connecter
        </Button>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-text-muted text-sm mx-4">ou</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <View className="gap-3">
          <Button
            variant="secondary"
            onPress={handleGoogleSignIn}
            loading={oauthLoading === 'google'}
            disabled={isLoading || (!!oauthLoading && oauthLoading !== 'google')}
            accessibilityLabel="Continuer avec Google"
          >
            Continuer avec Google
          </Button>

          <Button
            variant="secondary"
            onPress={handleAppleSignIn}
            loading={oauthLoading === 'apple'}
            disabled={isLoading || (!!oauthLoading && oauthLoading !== 'apple')}
            accessibilityLabel="Continuer avec Apple"
          >
            Continuer avec Apple
          </Button>
        </View>

        <View className="flex-row items-center justify-center mt-8">
          <Text className="text-text-secondary text-sm">Pas encore de compte ? </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable accessibilityLabel="Créer un compte">
              <Text className="text-accent text-sm font-semibold">Créer un compte</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
