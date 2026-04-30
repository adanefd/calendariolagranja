import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEventStore, EventStatus } from '@/src/store/useEventStore';
import { scheduleEventReminder } from '@/src/utils/notifications';

export default function EventFormView() {
  const router = useRouter();
  const { date, id } = useLocalSearchParams<{ date?: string; id?: string }>();
  const { events, addEvent, updateEvent } = useEventStore();

  const isEditing = !!id;
  const existingEvent = isEditing ? events.find(e => e.id === id) : null;

  const [status, setStatus] = useState<EventStatus>(existingEvent?.status || 'Tentativo');
  const [soldBy, setSoldBy] = useState(existingEvent?.soldBy || '');
  const [advancePayment, setAdvancePayment] = useState(existingEvent?.advancePayment || '');
  const [totalPrice, setTotalPrice] = useState(existingEvent?.totalPrice || '');
  const [notes, setNotes] = useState(existingEvent?.notes || '');
  
  // Date comes from param if new, or from existing event if editing
  const eventDate = existingEvent?.date || date || '';

  const sendWhatsApp = (eventData: { date: string; status: string; soldBy: string; advancePayment: string; totalPrice: string; notes: string }) => {
    const displayDate = eventData.date.split('-').reverse().join('/');
    
    let message = `✨ *EVENTO - ${eventData.status.toUpperCase()}* ✨\n\n`;
    message += `📅 *Fecha:* ${displayDate}\n`;
    message += `👤 *Vendido por:* ${eventData.soldBy}\n`;
    
    if (eventData.advancePayment) {
      message += `💰 *Anticipo:* $${eventData.advancePayment}\n`;
    }
    if (eventData.totalPrice) {
      message += `💵 *Precio Total:* $${eventData.totalPrice}\n`;
    }
    if (eventData.notes) {
      message += `\n📝 *Notas:* ${eventData.notes}\n`;
    }
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert('No se pudo abrir WhatsApp.');
    });
  };

  const handleSave = () => {
    if (!soldBy.trim()) {
      Alert.alert("Campo Obligatorio", "Por favor ingresa quién vendió el evento.");
      return;
    }

    // Validation for multiple events on the same day
    if (!isEditing) {
      const existingEventsOnDate = events.filter(e => e.date === eventDate);
      if (existingEventsOnDate.length > 0) {
        Alert.alert(
          "Día Ocupado",
          "Ya hay un evento registrado para este día. ¿Seguro que deseas agregar otro?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Sí, Agregar", onPress: saveEvent }
          ]
        );
        return;
      }
    }
    
    saveEvent();
  };

  const saveEvent = () => {
    const eventData = {
      date: eventDate,
      status,
      soldBy: soldBy.trim(),
      advancePayment: advancePayment.trim(),
      totalPrice: totalPrice.trim(),
      notes: notes.trim()
    };

    if (isEditing && id) {
      updateEvent(id, eventData);
      scheduleEventReminder(id, eventDate, eventData.soldBy);
      router.back();
    } else {
      const newId = Date.now().toString();
      addEvent({ ...eventData, id: newId });
      scheduleEventReminder(newId, eventDate, eventData.soldBy);
      
      // Ask if user wants to share via WhatsApp
      Alert.alert(
        "✅ Evento Guardado",
        "¿Deseas compartir este evento por WhatsApp?",
        [
          { text: "No, Gracias", style: "cancel", onPress: () => router.back() },
          { text: "Enviar por WhatsApp", onPress: () => {
            sendWhatsApp(eventData);
            router.back();
          }}
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateLabel}>Fecha: {eventDate.split('-').reverse().join('/')}</Text>

        <Text style={styles.label}>Estado del Evento</Text>
        <View style={styles.statusContainer}>
          <TouchableOpacity 
            style={[styles.statusButton, status === 'Tentativo' && styles.statusTentativeActive]}
            onPress={() => setStatus('Tentativo')}
          >
            <Text style={[styles.statusText, status === 'Tentativo' && styles.statusTextActive]}>Tentativo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statusButton, status === 'Apartado' && styles.statusBookedActive]}
            onPress={() => setStatus('Apartado')}
          >
            <Text style={[styles.statusText, status === 'Apartado' && styles.statusTextActive]}>Apartado</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>¿Quién lo vendió? *</Text>
        <TextInput
          style={styles.input}
          value={soldBy}
          onChangeText={setSoldBy}
          placeholder="Ej. María"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Anticipo ($) - Opcional</Text>
        <TextInput
          style={styles.input}
          value={advancePayment}
          onChangeText={setAdvancePayment}
          placeholder="Ej. 500"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Precio Total ($) - Opcional</Text>
        <TextInput
          style={styles.input}
          value={totalPrice}
          onChangeText={setTotalPrice}
          placeholder="Ej. 2000"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notas Adicionales</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Detalles, horarios, etc."
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Evento</Text>
        </TouchableOpacity>
        
        <View style={{height: 40}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    padding: 20,
  },
  dateLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    padding: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statusTentativeActive: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFC107',
  },
  statusBookedActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
  },
  statusTextActive: {
    color: '#1A1A1A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
