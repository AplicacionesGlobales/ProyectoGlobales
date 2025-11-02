// components/Appointments/AppointmentFilters.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AppointmentFilters as FiltersType, AppointmentStatus } from '../../types/appointments.types';

interface AppointmentFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: Partial<FiltersType>) => void;
  onReset: () => void;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<FiltersType>(filters);

  // Opciones de período
  const periodOptions = [
    { value: 'all', label: 'Todas', icon: 'calendar-outline' },
    { value: 'upcoming', label: 'Próximas', icon: 'arrow-forward-circle-outline' },
    { value: 'past', label: 'Pasadas', icon: 'arrow-back-circle-outline' },
    { value: 'today', label: 'Hoy', icon: 'today-outline' },
  ] as const;

  // Opciones de estado
  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente', color: '#F59E0B', icon: 'time-outline' },
    { value: 'CONFIRMED', label: 'Confirmada', color: '#3B82F6', icon: 'checkmark-circle-outline' },
    { value: 'COMPLETED', label: 'Completada', color: '#10B981', icon: 'checkmark-done-circle-outline' },
    { value: 'CANCELLED', label: 'Cancelada', color: '#EF4444', icon: 'close-circle-outline' },
    { value: 'NO_SHOW', label: 'No asistió', color: '#6B7280', icon: 'person-remove-outline' },
    { value: 'IN_PROGRESS', label: 'En progreso', color: '#8B5CF6', icon: 'hourglass-outline' },
  ] as const;

  // Contar filtros activos
  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.period && filters.period !== 'all') count++;
    if (filters.status) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  };

  // Aplicar filtros
  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setShowModal(false);
  };

  // Resetear filtros
  const handleReset = () => {
    const resetFilters: FiltersType = {
      period: 'all',
      page: 1,
      limit: 20,
    };
    setTempFilters(resetFilters);
    onReset();
    setShowModal(false);
  };

  // Toggle período
  const togglePeriod = (period: FiltersType['period']) => {
    setTempFilters(prev => ({
      ...prev,
      period,
      page: 1, // Reset page when changing filters
    }));
  };

  // Toggle estado
  const toggleStatus = (status: AppointmentStatus) => {
    setTempFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status,
      page: 1,
    }));
  };

  const activeCount = getActiveFiltersCount();

  return (
    <>
      {/* Botón principal de filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFiltersContainer}
        >
          {/* Filtros rápidos por período */}
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.quickFilterButton,
                { 
                  backgroundColor: filters.period === option.value 
                    ? colors.primary + '20' 
                    : colors.surface,
                  borderColor: filters.period === option.value 
                    ? colors.primary 
                    : 'transparent',
                  borderWidth: 1,
                },
              ]}
              onPress={() => onFiltersChange({ 
                period: option.value, 
                page: 1 
              })}
            >
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={filters.period === option.value ? colors.primary : colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.quickFilterText,
                  { 
                    color: filters.period === option.value 
                      ? colors.primary 
                      : colors.textSecondary 
                  }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Botón de filtros avanzados */}
          <TouchableOpacity
            style={[
              styles.advancedFilterButton,
              { backgroundColor: colors.surface },
            ]}
            onPress={() => {
              setTempFilters(filters);
              setShowModal(true);
            }}
          >
            <Ionicons name="options-outline" size={18} color={colors.text} />
            <Text style={[styles.advancedFilterText, { color: colors.text }]}>
              Filtros
            </Text>
            {activeCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Modal de filtros avanzados */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header del modal */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.textSecondary + '20' }]}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Filtrar Citas
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={[styles.resetButton, { color: colors.error }]}>
                Limpiar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Sección de período */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Período de Tiempo
              </Text>
              {periodOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    { backgroundColor: colors.surface },
                    tempFilters.period === option.value && {
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => togglePeriod(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={tempFilters.period === option.value ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: tempFilters.period === option.value ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {tempFilters.period === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sección de estado */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Estado de la Cita
              </Text>
              {statusOptions.map((option) => {
                const isSelected = tempFilters.status === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      { backgroundColor: colors.surface },
                      isSelected && {
                        backgroundColor: option.color + '15',
                        borderColor: option.color,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => toggleStatus(option.value as AppointmentStatus)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={isSelected ? option.color : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? option.color : colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={option.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer del modal */}
          <View style={[styles.modalFooter, { borderTopColor: colors.textSecondary + '20' }]}>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  quickFiltersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  advancedFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  advancedFilterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});