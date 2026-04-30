import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEventStore } from '@/src/store/useEventStore';
import { Pencil, MessageCircle } from 'lucide-react-native';

export default function EventDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events } = useEventStore();
  
  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Evento no encontrado</Text>
      </View>
    );
  }

  const handleWhatsApp = () => {
    // Build a nicely formatted WhatsApp message
    const displayDate = event.date.split('-').reverse().join('/');
    
    let message = `✨ *EVENTO - ${event.status.toUpperCase()}* ✨\n\n`;
    message += `📅 *Fecha:* ${displayDate}\n`;
    message += `👤 *Vendido por:* ${event.soldBy}\n`;
    
    if (event.advancePayment) {
      message += `💰 *Anticipo:* $${event.advancePayment}\n`;
    }
    if (event.totalPrice) {
      message += `💵 *Precio Total:* $${event.totalPrice}\n`;
    }
    if (event.notes) {
      message += `\n📝 *Notas:* ${event.notes}\n`;
    }
    
    // Use https://wa.me/ which works without declaring URL schemes
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert('No se pudo abrir WhatsApp. Verifica que esté instalado.');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.date}>{event.date.split('-').reverse().join('/')}</Text>
          <View style={[styles.statusBadge, event.status === 'Apartado' ? styles.statusBooked : styles.statusTentative]}>
            <Text style={[styles.statusText, event.status === 'Apartado' ? styles.statusTextBooked : styles.statusTextTentative]}>
              {event.status}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Vendido por:</Text>
          <Text style={styles.value}>{event.soldBy}</Text>
        </View>

        {event.advancePayment ? (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Anticipo:</Text>
            <Text style={styles.moneyValue}>${event.advancePayment}</Text>
          </View>
        ) : null}

        {event.totalPrice ? (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Precio Total:</Text>
            <Text style={styles.moneyValue}>${event.totalPrice}</Text>
          </View>
        ) : null}

        {event.notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.label}>Notas:</Text>
            <Text style={styles.notes}>{event.notes}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '/event-form', params: { id: event.id } })}>
        <Pencil color="#FFF" size={24} style={{ marginRight: 10 }} />
        <Text style={styles.actionButtonText}>Editar Evento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, styles.whatsappButton]} onPress={handleWhatsApp}>
        <MessageCircle color="#FFF" size={24} style={{ marginRight: 10 }} />
        <Text style={styles.actionButtonText}>Enviar por WhatsApp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 16,
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTentative: {
    backgroundColor: '#FFF8E1',
  },
  statusBooked: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusTextTentative: {
    color: '#FF8F00',
  },
  statusTextBooked: {
    color: '#2E7D32',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    color: '#757575',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  moneyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  notes: {
    fontSize: 18,
    color: '#424242',
    marginTop: 8,
    lineHeight: 26,
  },
  actionButton: {
    backgroundColor: '#424242',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
