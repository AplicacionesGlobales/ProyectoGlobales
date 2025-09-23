// src/components/calendar/StatusIndicator.tsx
// Componente para indicadores visuales de estado en calendario

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

// Tipos de estados de citas (basado en datos reales del backend)
type AppointmentStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';

// Props del componente
interface StatusIndicatorProps {
    status?: AppointmentStatus;
    size?: 'small' | 'medium' | 'large';
    variant?: 'dot' | 'badge' | 'icon' | 'full' | 'dots';
    showText?: boolean;
    showIcon?: boolean;
    customText?: string;
    serviceColor?: string; // Color del serviceType desde el backend
    statusCounts?: Partial<Record<AppointmentStatus, number>>;
    maxDots?: number;
}

// Configuración de colores por estado (fallback cuando no hay serviceColor)
const STATUS_COLORS = {
    PENDING: '#F59E0B',     // Amber
    CONFIRMED: '#3B82F6',   // Blue
    IN_PROGRESS: '#10B981', // Green
    COMPLETED: '#6B7280',   // Gray
    CANCELLED: '#EF4444',   // Red
    NO_SHOW: '#F97316'      // Orange
} as const;

// Configuración de iconos por estado
const STATUS_ICONS = {
    PENDING: 'time-outline' as const,
    CONFIRMED: 'checkmark-circle-outline' as const,
    IN_PROGRESS: 'play-circle-outline' as const,
    COMPLETED: 'checkmark-outline' as const,
    CANCELLED: 'close-outline' as const,
    NO_SHOW: 'person-remove-outline' as const
};

// Textos por estado
const STATUS_LABELS = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No se presentó'
} as const;

// Hook personalizado para lógica del StatusIndicator
const useStatusIndicator = (
    status?: AppointmentStatus,
    serviceColor?: string,
    statusCounts?: Partial<Record<AppointmentStatus, number>>
) => {
    const getStatusColor = (statusKey: AppointmentStatus): string => {
        // Prioridad: 1. Color del servicio, 2. Color por estado
        if (statusKey === status && serviceColor) {
            return serviceColor;
        }
        return STATUS_COLORS[statusKey];
    };

    const getStatusIcon = (statusKey: AppointmentStatus): keyof typeof Ionicons.glyphMap => {
        return STATUS_ICONS[statusKey];
    };

    const getStatusLabel = (statusKey: AppointmentStatus): string => {
        return STATUS_LABELS[statusKey];
    };

    // Calcular estado predominante cuando hay múltiples estados
    const getDominantStatus = (): AppointmentStatus | null => {
        if (!statusCounts) return status || null;

        let maxCount = 0;
        let dominantStatus: AppointmentStatus | null = null;

        Object.entries(statusCounts).forEach(([statusKey, count]) => {
            if (count && count > 0 && count > maxCount) {
                maxCount = count;
                dominantStatus = statusKey as AppointmentStatus;
            }
        });

        return dominantStatus;
    };

    // Obtener top N estados por cantidad
    const getTopStatuses = (limit: number = 3): Array<{ status: AppointmentStatus; count: number }> => {
        if (!statusCounts) return [];

        return Object.entries(statusCounts)
            .filter(([_, count]) => count && count > 0)
            .map(([status, count]) => ({
                status: status as AppointmentStatus,
                count: count!
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    };

    // Obtener color con opacidad
    const getColorWithOpacity = (color: string, opacity: number): string => {
        // Si el color viene con #, convertir a rgba
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
    };

    return {
        getStatusColor,
        getStatusIcon,
        getStatusLabel,
        getDominantStatus,
        getTopStatuses,
        getColorWithOpacity
    };
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    size = 'medium',
    variant = 'badge',
    showText = true,
    showIcon = false,
    customText,
    serviceColor,
    statusCounts,
    maxDots = 3
}) => {
    const { colors } = useTheme();

    const {
        getStatusColor,
        getStatusIcon,
        getStatusLabel,
        getDominantStatus,
        getTopStatuses,
        getColorWithOpacity
    } = useStatusIndicator(status, serviceColor, statusCounts);

    // Determinar el estado a mostrar
    const displayStatus = status || getDominantStatus();
    const topStatuses = getTopStatuses(maxDots);

    // Configuración de tamaños
    const sizeConfig = {
        small: { dot: 6, icon: 12, text: 10, badge: 16, padding: 4 },
        medium: { dot: 8, icon: 16, text: 12, badge: 20, padding: 6 },
        large: { dot: 12, icon: 20, text: 14, badge: 24, padding: 8 }
    };

    const currentSize = sizeConfig[size];

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        // Variante Dot - Un solo punto
        dot: {
            width: currentSize.dot,
            height: currentSize.dot,
            borderRadius: currentSize.dot / 2,
            marginRight: 4,
        },
        // Variante Dots - Múltiples puntos
        dotsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
        },
        dotSmall: {
            width: currentSize.dot * 0.7,
            height: currentSize.dot * 0.7,
            borderRadius: (currentSize.dot * 0.7) / 2,
        },
        dotMedium: {
            width: currentSize.dot,
            height: currentSize.dot,
            borderRadius: currentSize.dot / 2,
        },
        dotLarge: {
            width: currentSize.dot * 1.3,
            height: currentSize.dot * 1.3,
            borderRadius: (currentSize.dot * 1.3) / 2,
        },
        // Variante Badge
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: currentSize.padding,
            paddingVertical: currentSize.padding / 2,
            borderRadius: currentSize.badge / 2,
            minHeight: currentSize.badge,
        },
        // Variante Icon
        iconContainer: {
            marginRight: showText ? 4 : 0,
        },
        // Variante Full
        fullContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: currentSize.padding,
            borderRadius: 8,
            borderLeftWidth: 4,
            flex: 1,
        },
        // Textos
        text: {
            fontSize: currentSize.text,
            fontWeight: '500',
        },
        textLight: {
            color: colors.surface,
        },
        textDark: {
            color: colors.text,
        },
        textSecondary: {
            color: colors.textSecondary,
        },
        // Contador para dots
        countText: {
            fontSize: currentSize.text - 1,
            color: colors.textSecondary,
            marginLeft: 4,
            fontWeight: '400',
        },
    });

    // Renderizar según variante
    const renderIndicator = () => {
        switch (variant) {
            case 'dot':
                if (!displayStatus) {
                    return null;
                }
                const dotColor = getStatusColor(displayStatus);
                return (
                    <View style={styles.container}>
                        <View
                            style={[
                                styles.dot,
                                { backgroundColor: dotColor }
                            ]}
                        />
                        {showText && (
                            <Text style={[styles.text, styles.textSecondary]}>
                                {customText || getStatusLabel(displayStatus)}
                            </Text>
                        )}
                    </View>
                );

            case 'dots':
                if (topStatuses.length === 0) {
                    return null;
                }
                const totalCount = topStatuses.reduce((sum, s) => sum + s.count, 0);

                return (
                    <View style={styles.container}>
                        <View style={styles.dotsContainer}>
                            {topStatuses.map((item, index) => {
                                // Tamaño del punto basado en la cantidad relativa
                                const percentage = item.count / totalCount;
                                let dotStyle = styles.dotSmall;

                                if (percentage > 0.5) {
                                    dotStyle = styles.dotLarge;
                                } else if (percentage > 0.3) {
                                    dotStyle = styles.dotMedium;
                                }

                                return (
                                    <View
                                        key={`${item.status}-${index}`}
                                        style={[
                                            dotStyle,
                                            { backgroundColor: getStatusColor(item.status) }
                                        ]}
                                    />
                                );
                            })}
                        </View>
                        {showText && (
                            <Text style={[styles.text, styles.countText]}>
                                {customText || `${totalCount}`}
                            </Text>
                        )}
                    </View>
                );

            case 'badge':
                if (!displayStatus) {
                    return null;
                }
                const bgColor = getStatusColor(displayStatus);
                return (
                    <View style={[
                        styles.badge,
                        { backgroundColor: getColorWithOpacity(bgColor, 0.15) }
                    ]}>
                        {showIcon && (
                            <Ionicons
                                name={getStatusIcon(displayStatus)}
                                size={currentSize.icon}
                                color={bgColor}
                                style={styles.iconContainer}
                            />
                        )}
                        {showText && (
                            <Text style={[styles.text, { color: bgColor }]}>
                                {customText || getStatusLabel(displayStatus)}
                            </Text>
                        )}
                    </View>
                ); case 'icon':
                if (!displayStatus) return null;
                return (
                    <View style={styles.container}>
                        <Ionicons
                            name={getStatusIcon(displayStatus)}
                            size={currentSize.icon}
                            color={getStatusColor(displayStatus)}
                            style={styles.iconContainer}
                        />
                        {showText && (
                            <Text style={[styles.text, styles.textDark]}>
                                {customText || getStatusLabel(displayStatus)}
                            </Text>
                        )}
                    </View>
                );

            case 'full':
                if (!displayStatus) return null;
                const statusColor = getStatusColor(displayStatus);
                return (
                    <View style={[
                        styles.fullContainer,
                        {
                            backgroundColor: getColorWithOpacity(statusColor, 0.1),
                            borderLeftColor: statusColor,
                        }
                    ]}>
                        {showIcon && (
                            <Ionicons
                                name={getStatusIcon(displayStatus)}
                                size={currentSize.icon}
                                color={statusColor}
                                style={styles.iconContainer}
                            />
                        )}
                        <View style={{ flex: 1 }}>
                            {showText && (
                                <Text style={[styles.text, styles.textDark]}>
                                    {customText || getStatusLabel(displayStatus)}
                                </Text>
                            )}
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return renderIndicator();
};

export default StatusIndicator;
export { useStatusIndicator, STATUS_COLORS, STATUS_ICONS, STATUS_LABELS };
export type { StatusIndicatorProps, AppointmentStatus };