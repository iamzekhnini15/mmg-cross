import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL ou Anon Key manquante. Créez un fichier .env à la racine du projet avec :\n' +
      'EXPO_PUBLIC_SUPABASE_URL=<votre_url>\n' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY=<votre_clé>',
  );
}

// expo-secure-store n'est pas disponible sur web — fallback sur localStorage
// On vérifie aussi typeof window pour le SSR (static rendering dans Node.js)
const secureStoreAdapter = {
  getItem: (key: string): string | null | Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): void | Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value) as unknown as void;
  },
  removeItem: (key: string): void | Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key) as unknown as void;
  },
};

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
  {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
);
