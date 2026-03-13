import '../global.css';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Providers } from '@/providers/Providers';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Providers>
          <StatusBar style="light" />
          <Slot />
        </Providers>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
