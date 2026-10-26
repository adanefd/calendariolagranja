import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  return true;
}

export async function scheduleEventReminder(eventId: string, eventDateStr: string, soldBy: string) {
  // Cancel previous notification for this event if it exists
  await cancelEventReminder(eventId);

  // Parse event date (YYYY-MM-DD)
  const [year, month, day] = eventDateStr.split('-').map(Number);
  const eventDate = new Date(year, month - 1, day, 10, 0, 0); // At 10:00 AM
  
  // Set reminder for 1 day before
  const reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - 1);

  // If the reminder date is in the past, don't schedule
  if (reminderDate <= new Date()) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📅 Recordatorio de Evento',
      body: `Mañana tienes un evento vendido por ${soldBy}. Revisa la aplicación para los detalles.`,
      data: { eventId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
    identifier: `reminder_${eventId}`,
  });
}

export async function cancelEventReminder(eventId: string) {
  await Notifications.cancelScheduledNotificationAsync(`reminder_${eventId}`);
}
