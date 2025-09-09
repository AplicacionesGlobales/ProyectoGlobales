// src/components/debug/CalendarComparisonScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { DailyCalendarView } from '@/components/calendar/DailyCalendarView';
import WeeklyCalendarView from '@/components/ui/WeeklyCalendarView';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const EXAMPLE_BRAND_ID = 1;

type CalendarMode = 'daily' | 'weekly' | 'comparison';

export const CalendarComparisonScreen: React.FC = () => {
  const [mode, setMode] = useState<CalendarMode>('comparison');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleSlotPress = (timeSlot: string, date: string) => {
    Alert.alert(
      'Slot Seleccionado',
      `Fecha: ${date}\nHora: ${timeSlot}\nModo: ${mode}`,
      [
        { text: 'OK' }
      ]
    );
  };

  const handleAppointmentPress = (appointmentId: number) => {
    Alert.alert(
      'Cita Seleccionada',
      `ID: ${appointmentId}\nModo: ${mode}`,
      [
        { text: 'OK' }
      ]
    );
  };

  // Weekly calendar compatible handlers
  const handleWeeklySlotPress = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    handleSlotPress(time, dateStr);
  };

  const handleWeeklyAppointmentPress = (appointment: any) => {
    handleAppointmentPress(appointment.id);
  };

  const renderModeSelector = () => (
    <View style={[styles.modeSelector, { backgroundColor: backgroundColor }]}>
      <ThemedText style={styles.selectorTitle}>
        Modo de Vista
      </ThemedText>
      
      <View style={styles.modeButtons}>
        {[
          { key: 'daily', label: 'Diario', icon: 'calendar' },
          { key: 'weekly', label: 'Semanal', icon: 'calendar-outline' },
          { key: 'comparison', label: 'Comparación', icon: 'apps' }
        ].map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.modeButton,
              { 
                backgroundColor: mode === key ? tintColor : 'transparent',
                borderColor: tintColor 
              }
            ]}
            onPress={() => setMode(key as CalendarMode)}
          >
            <Ionicons 
              name={icon as any} 
              size={16} 
              color={mode === key ? 'white' : tintColor} 
            />
            <Text 
              style={[
                styles.modeButtonText,
                { color: mode === key ? 'white' : tintColor }
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDailyView = () => (
    <View style={styles.viewContainer}>
      <ThemedText style={styles.viewTitle}>
        Vista Diaria
      </ThemedText>
      <View style={styles.calendarContainer}>
        <DailyCalendarView
          brandId={EXAMPLE_BRAND_ID}
          initialDate={selectedDate}
          onSlotPress={handleSlotPress}
          onAppointmentPress={handleAppointmentPress}
          autoRefresh={true}
        />
      </View>
    </View>
  );

  const renderWeeklyView = () => (
    <View style={styles.viewContainer}>
      <ThemedText style={styles.viewTitle}>
        Vista Semanal
      </ThemedText>
      <View style={styles.calendarContainer}>
        <ThemedText style={styles.placeholderText}>
          Vista semanal disponible con diferentes props.
          {'\n'}Ver WeeklyCalendarView.tsx para detalles.
        </ThemedText>
      </View>
    </View>
  );

  const renderComparisonView = () => (
    <ScrollView style={styles.comparisonContainer}>
      <ThemedText style={styles.comparisonTitle}>
        🔍 Comparación de Calendarios
      </ThemedText>
      
      {/* Daily View */}
      <View style={[styles.comparisonSection, { borderColor: tintColor }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color={tintColor} />
          <ThemedText style={styles.sectionTitle}>
            Vista Diaria
          </ThemedText>
        </View>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Timeline vertical con horas del día
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Auto-scroll a la hora actual
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Indicador de tiempo en vivo
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Citas como bloques proporcionales
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Slots disponibles interactivos
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Navegación día a día
            </ThemedText>
          </View>
        </View>
        
        <View style={[styles.calendarPreview, { height: 300 }]}>
          <DailyCalendarView
            brandId={EXAMPLE_BRAND_ID}
            initialDate={selectedDate}
            onSlotPress={handleSlotPress}
            onAppointmentPress={handleAppointmentPress}
            autoRefresh={false}
          />
        </View>
      </View>

      {/* Weekly View */}
      <View style={[styles.comparisonSection, { borderColor: tintColor }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color={tintColor} />
          <ThemedText style={styles.sectionTitle}>
            Vista Semanal
          </ThemedText>
        </View>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Grid semanal con 7 días
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Vista general de la semana
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Navegación semana a semana
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Horarios de negocio por día
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Citas distribuidas por día
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.featureText}>
              Resumen visual semanal
            </ThemedText>
          </View>
        </View>
        
        <View style={[styles.calendarPreview, { height: 300 }]}>
          <ThemedText style={styles.placeholderText}>
            Vista semanal disponible con diferentes props.
            {'\n'}Ver WeeklyCalendarView.tsx para detalles.
          </ThemedText>
        </View>
      </View>

      {/* Comparison Table */}
      <View style={[styles.comparisonSection, { borderColor: tintColor }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics" size={20} color={tintColor} />
          <ThemedText style={styles.sectionTitle}>
            Tabla Comparativa
          </ThemedText>
        </View>
        
        <View style={styles.comparisonTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { color: textColor }]}>
              Característica
            </Text>
            <Text style={[styles.tableHeaderText, { color: textColor }]}>
              Diario
            </Text>
            <Text style={[styles.tableHeaderText, { color: textColor }]}>
              Semanal
            </Text>
          </View>
          
          {[
            ['Detalle temporal', '✅ Alto', '⚡ Medio'],
            ['Vista general', '⚡ Baja', '✅ Alta'],
            ['Timeline vertical', '✅ Sí', '❌ No'],
            ['Grid horizontal', '❌ No', '✅ Sí'],
            ['Auto-scroll', '✅ Sí', '❌ No'],
            ['Tiempo real', '✅ Sí', '⚡ Parcial'],
            ['Navegación', '📅 Día a día', '📊 Semana a semana'],
            ['Mejor para', '🎯 Gestión diaria', '📈 Planificación'],
          ].map(([feature, daily, weekly], index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { color: textColor }]}>
                {feature}
              </Text>
              <Text style={[styles.tableCell, { color: textColor }]}>
                {daily}
              </Text>
              <Text style={[styles.tableCell, { color: textColor }]}>
                {weekly}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container}>
      {renderModeSelector()}
      
      {mode === 'daily' && renderDailyView()}
      {mode === 'weekly' && renderWeeklyView()}
      {mode === 'comparison' && renderComparisonView()}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  viewContainer: {
    flex: 1,
  },
  viewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  calendarContainer: {
    flex: 1,
  },
  comparisonContainer: {
    flex: 1,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
  },
  comparisonSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  calendarPreview: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  comparisonTable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
    padding: 20,
  },
});
