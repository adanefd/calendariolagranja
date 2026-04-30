import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useEventStore, SalonEvent } from '@/src/store/useEventStore';
import { format } from 'date-fns';
import { cancelEventReminder } from '@/src/utils/notifications';

// Spanish localization for the calendar
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Sept.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function HomeView() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { events, deleteEvent } = useEventStore();

  // Filter events for the selected day
  const eventsForSelectedDay = useMemo(() => {
    return events.filter(e => e.date === selectedDate);
  }, [events, selectedDate]);

  // Create marked dates for the calendar
  const markedDates = useMemo(() => {
    const dates: any = {};
    
    events.forEach(event => {
      const color = event.status === 'Apartado' ? '#4CAF50' : '#FFC107'; // Green or Yellow
      
      if (!dates[event.date]) {
        dates[event.date] = { dots: [{ key: event.id, color }] };
      } else {
        dates[event.date].dots.push({ key: event.id, color });
      }
    });

    // Mark the selected date
    if (dates[selectedDate]) {
      dates[selectedDate] = { ...dates[selectedDate], selected: true, selectedColor: '#E0E0E0' };
    } else {
      dates[selectedDate] = { selected: true, selectedColor: '#E0E0E0' };
    }

    return dates;
  }, [events, selectedDate]);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar Evento",
      "¿Estás segura de que deseas eliminar este evento? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => {
            deleteEvent(id);
            cancelEventReminder(id);
        } }
      ]
    );
  };

  const renderEvent = ({ item }: { item: SalonEvent }) => {
    const isBooked = item.status === 'Apartado';
    return (
      <TouchableOpacity 
        style={[styles.eventCard, { borderLeftColor: isBooked ? '#4CAF50' : '#FFC107' }]}
        onPress={() => router.push(`/event/${item.id}`)}
      >
        <View style={styles.eventInfo}>
          <Text style={styles.eventStatus}>{item.status}</Text>
          <Text style={styles.eventSeller}>Vendido por: {item.soldBy}</Text>
          {item.advancePayment ? (
            <Text style={styles.eventMoney}>Anticipo: ${item.advancePayment}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Trash2 color="#F44336" size={24} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType={'multi-dot'}
        theme={{
          todayTextColor: '#007BFF',
          arrowColor: '#1A1A1A',
          textMonthFontWeight: 'bold',
          textMonthFontSize: 20,
          textDayFontSize: 16,
        }}
      />

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          Eventos del día {selectedDate.split('-').reverse().join('/')}
        </Text>
        
        {eventsForSelectedDay.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay eventos este día</Text>
          </View>
        ) : (
          <FlatList
            data={eventsForSelectedDay}
            keyExtractor={item => item.id}
            renderItem={renderEvent}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push({ pathname: '/event-form', params: { date: selectedDate } })}
      >
        <Plus color="#FFF" size={32} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A1A1A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventInfo: {
    flex: 1,
  },
  eventStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventSeller: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 2,
  },
  eventMoney: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 999, // Force it to the front
  },
});
