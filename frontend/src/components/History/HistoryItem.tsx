import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryItem as HistoryItemType } from '../../types/history.types';
import { useTheme } from '../../contexts/ThemeContext';

interface HistoryItemProps {
    item: HistoryItemType;
    onPress?: (item: HistoryItemType) => void;
    showDetails?: boolean;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
    item,
    onPress,
    showDetails = false,
}) => {
    const { colors } = useTheme();
    const [expanded, setExpanded] = useState(showDetails);

    // Obtener icono según el tipo
    const getIcon = (): string => {
        switch (item.type) {
            case 'appointment':
                return 'calendar';
            case 'payment':
                return 'card';
            case 'service':
                return 'star';
            default:
                return 'time';
        }
    };

    // Obtener color según el estado
    const getStatusColor = (): string => {
        switch (item.status) {
            case 'completed':
                return colors.success;
            case 'cancelled':
                return colors.error;
            case 'confirmed':
                return colors.primary;
            case 'pending':
                return colors.warning;
            default:
                return colors.textSecondary;
        }
    };

    // Obtener texto del estado
    const getStatusText = (): string => {
        switch (item.status) {
            case 'completed':
                return 'Completado';
            case 'cancelled':
                return 'Cancelado';
            case 'confirmed':
                return 'Confirmado';
            case 'pending':
                return 'Pendiente';
            default:
                return '';
        }
    };

    // Formatear fecha
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Formatear hora
    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Formatear moneda
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(amount);
    };

    // Manejar tap
    const handlePress = () => {
        if (onPress) {
            onPress(item);
        } else {
            setExpanded(!expanded);
        }
    };

    // Renderizar detalles expandidos
    const renderDetails = () => {
        if (!expanded) return null;

        switch (item.type) {
            case 'appointment':
                const appointmentDetails = item.details as any;
                return (
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Servicio:
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {appointmentDetails.serviceName}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Profesional:
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {appointmentDetails.professional}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Duración:
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {appointmentDetails.duration} min
                            </Text>
                        </View>
                        {appointmentDetails.notes && (
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Notas:
                                </Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>
                                    {appointmentDetails.notes}
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 'payment':
                const paymentDetails = item.details as any;
                return (
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Método:
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {paymentDetails.method === 'credit_card' ? 'Tarjeta de Crédito' :
                                    paymentDetails.method === 'debit_card' ? 'Tarjeta de Débito' :
                                        paymentDetails.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Recibo:
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {paymentDetails.receipt}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Servicio:
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {paymentDetails.serviceAssociated}
                            </Text>
                        </View>
                    </View>
                );

            case 'service':
                const serviceDetails = item.details as any;
                return (
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Categoría:
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {serviceDetails.category}
                            </Text>
                        </View>
                        {serviceDetails.rating && (
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Calificación:
                                </Text>
                                <View style={styles.ratingContainer}>
                                    {[...Array(5)].map((_, i) => (
                                        <Ionicons
                                            key={i}
                                            name={i < serviceDetails.rating ? 'star' : 'star-outline'}
                                            size={16}
                                            color={colors.warning}
                                            style={styles.star}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                        {serviceDetails.review && (
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Reseña:
                                </Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>
                                    {serviceDetails.review}
                                </Text>
                            </View>
                        )}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {/* Timeline indicator */}
                <View style={styles.timelineContainer}>
                    <View style={[styles.timelineIcon, { backgroundColor: getStatusColor() }]}>
                        <Ionicons name={getIcon() as any} size={16} color="white" />
                    </View>
                    <View style={[styles.timelineLine, { backgroundColor: colors.textSecondary }]} />
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                                {item.subtitle}
                            </Text>
                        </View>

                        <View style={styles.rightContainer}>
                            {item.amount && (
                                <Text style={[styles.amount, { color: colors.text }]}>
                                    {formatCurrency(item.amount)}
                                </Text>
                            )}
                            <Text style={[styles.time, { color: colors.textSecondary }]}>
                                {formatTime(item.date)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.dateContainer}>
                            <Text style={[styles.date, { color: colors.textSecondary }]}>
                                {formatDate(item.date)}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                    {getStatusText()}
                                </Text>
                            </View>
                        </View>

                        <Ionicons
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </View>

                    {renderDetails()}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    content: {
        flexDirection: 'row',
        padding: 16,
    },
    timelineContainer: {
        alignItems: 'center',
        marginRight: 16,
        width: 24,
    },
    timelineIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        marginTop: 8,
        opacity: 0.3,
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
    },
    rightContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    time: {
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailsContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f2f5',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '500',
        width: 80,
    },
    detailValue: {
        fontSize: 12,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    star: {
        marginRight: 2,
    },
});
