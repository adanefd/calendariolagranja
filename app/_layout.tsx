import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '@/src/utils/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F8F9FA' },
          headerTintColor: '#1A1A1A',
          headerTitleStyle: { fontWeight: '700', fontSize: 20 },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Mis Eventos' }} />
        <Stack.Screen name="event-form" options={{ presentation: 'modal', title: 'Nuevo Evento' }} />
        <Stack.Screen name="event/[id]" options={{ title: 'Detalle del Evento' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
