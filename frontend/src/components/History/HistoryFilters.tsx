import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryFilters as HistoryFiltersType, HistoryItemType, HistoryStatus } from '../../types/history.types';
import { useTheme } from '../../contexts/ThemeContext';

interface HistoryFiltersProps {
    filters: HistoryFiltersType;
    onFiltersChange: (filters: Partial<HistoryFiltersType>) => void;
    onReset: () => void;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
    filters,
    onFiltersChange,
    onReset,
}) => {
    const { colors } = useTheme();
    const [showModal, setShowModal] = useState(false);
    const [tempFilters, setTempFilters] = useState<HistoryFiltersType>(filters);

    // Opciones de tipo
    const typeOptions: { value: HistoryItemType; label: string; icon: string }[] = [
        { value: 'appointment', label: 'Citas', icon: 'calendar' },
        { value: 'payment', label: 'Pagos', icon: 'card' },
        { value: 'service', label: 'Servicios', icon: 'star' },
    ];

    // Opciones de estado
    const statusOptions: { value: HistoryStatus; label: string; color: string }[] = [
        { value: 'completed', label: 'Completado', color: colors.success },
        { value: 'confirmed', label: 'Confirmado', color: colors.primary },
        { value: 'pending', label: 'Pendiente', color: colors.warning },
        { value: 'cancelled', label: 'Cancelado', color: colors.error },
    ];

    // Contar filtros activos
    const getActiveFiltersCount = (): number => {
        let count = 0;

        if (filters.types.length < 3) count++; // No todos los tipos seleccionados
        if (filters.status && filters.status.length > 0) count++;
        if (filters.startDate || filters.endDate) count++;
        if (filters.sortOrder !== 'desc') count++; // Orden diferente al default

        return count;
    };

    // Aplicar filtros temporales
    const applyFilters = () => {
        onFiltersChange(tempFilters);
        setShowModal(false);
    };

    // Resetear filtros
    const handleReset = () => {
        onReset();
        setTempFilters({
            types: ['appointment', 'payment', 'service'],
            sortOrder: 'desc',
        });
        setShowModal(false);
    };

    // Toggle tipo
    const toggleType = (type: HistoryItemType) => {
        const newTypes = tempFilters.types.includes(type)
            ? tempFilters.types.filter(t => t !== type)
            : [...tempFilters.types, type];

        setTempFilters(prev => ({ ...prev, types: newTypes }));
    };

    // Toggle estado
    const toggleStatus = (status: HistoryStatus) => {
        const currentStatus = tempFilters.status || [];
        const newStatus = currentStatus.includes(status)
            ? currentStatus.filter(s => s !== status)
            : [...currentStatus, status];

        setTempFilters(prev => ({
            ...prev,
            status: newStatus.length > 0 ? newStatus : undefined
        }));
    };

    // Cambiar orden
    const toggleSortOrder = () => {
        setTempFilters(prev => ({
            ...prev,
            sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc',
        }));
    };

    const activeCount = getActiveFiltersCount();

    return (
        <>
            {/* Botón de filtros */}
            <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.surface }]}
                onPress={() => {
                    setTempFilters(filters);
                    setShowModal(true);
                }}
                activeOpacity={0.7}
            >
                <Ionicons name="filter" size={20} color={colors.text} />
                <Text style={[styles.filterButtonText, { color: colors.text }]}>
                    Filtros
                </Text>
                {activeCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.badgeText}>{activeCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Modal de filtros */}
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
                            Filtros
                        </Text>
                        <TouchableOpacity onPress={handleReset}>
                            <Text style={[styles.resetButton, { color: colors.error }]}>
                                Limpiar
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        {/* Tipos de eventos */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Tipos de Eventos
                            </Text>
                            {typeOptions.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.option,
                                        { backgroundColor: colors.surface },
                                        tempFilters.types.includes(option.value) && {
                                            backgroundColor: colors.primary + '10',
                                            borderColor: colors.primary,
                                            borderWidth: 1,
                                        },
                                    ]}
                                    onPress={() => toggleType(option.value)}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={20}
                                        color={tempFilters.types.includes(option.value) ? colors.primary : colors.textSecondary}
                                    />
                                    <Text
                                        style={[
                                            styles.optionText,
                                            {
                                                color: tempFilters.types.includes(option.value)
                                                    ? colors.primary
                                                    : colors.text,
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {tempFilters.types.includes(option.value) && (
                                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Estados */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Estados
                            </Text>
                            {statusOptions.map(option => {
                                const isSelected = tempFilters.status?.includes(option.value) || false;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.option,
                                            { backgroundColor: colors.surface },
                                            isSelected && {
                                                backgroundColor: option.color + '10',
                                                borderColor: option.color,
                                                borderWidth: 1,
                                            },
                                        ]}
                                        onPress={() => toggleStatus(option.value)}
                                    >
                                        <View
                                            style={[
                                                styles.statusDot,
                                                { backgroundColor: option.color },
                                            ]}
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
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={20} color={option.color} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Ordenamiento */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Ordenamiento
                            </Text>
                            <TouchableOpacity
                                style={[styles.option, { backgroundColor: colors.surface }]}
                                onPress={toggleSortOrder}
                            >
                                <Ionicons
                                    name={tempFilters.sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                                    size={20}
                                    color={colors.primary}
                                />
                                <Text style={[styles.optionText, { color: colors.text }]}>
                                    {tempFilters.sortOrder === 'desc' ? 'Más reciente primero' : 'Más antiguo primero'}
                                </Text>
                            </TouchableOpacity>
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
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
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
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    resetButton: {
        fontSize: 16,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
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
        width: 12,
        height: 12,
        borderRadius: 6,
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
