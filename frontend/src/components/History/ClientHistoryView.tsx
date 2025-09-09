import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClientHistory, useHistoryStats } from '../../hooks/useClientHistory';
import { HistoryTimeline } from './HistoryTimeline';
import { HistoryFilters } from './HistoryFilters';
import { HistoryItem as HistoryItemType } from '../../types/history.types';
import { useTheme } from '../../contexts/ThemeContext';

interface ClientHistoryViewProps {
    showTitle?: boolean;
    maxItems?: number; // Para vista compacta en el perfil
    onSeeAll?: () => void; // Callback para ver todo el historial
}

export const ClientHistoryView: React.FC<ClientHistoryViewProps> = ({
    showTitle = true,
    maxItems,
    onSeeAll,
}) => {
    const { colors } = useTheme();
    const {
        filteredItems,
        loading,
        filters,
        updateFilters,
        resetFilters,
        refresh,
        loadMore,
    } = useClientHistory();

    const stats = useHistoryStats();
    const [refreshing, setRefreshing] = useState(false);

    // Limitar items si es vista compacta
    const displayItems = maxItems ? filteredItems.slice(0, maxItems) : filteredItems;

    // Manejar refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    // Manejar tap en item
    const handleItemPress = (item: HistoryItemType) => {
        Alert.alert(
            item.title,
            `Tipo: ${item.type}\nFecha: ${new Date(item.date).toLocaleString('es-MX')}\nEstado: ${item.status}`,
            [{ text: 'OK' }]
        );
    };

    // Formatear moneda
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(amount);
    };

    // Renderizar estadísticas resumidas
    const renderStats = () => (
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                    {stats.totalAppointments}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Citas Totales
                </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                    {stats.completedAppointments}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Completadas
                </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatCurrency(stats.totalSpent)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Total Gastado
                </Text>
            </View>
        </View>
    );

    // Renderizar header con filtros (solo en vista completa)
    const renderHeader = () => {
        if (maxItems) return null; // No mostrar en vista compacta

        return (
            <View style={styles.headerContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    <HistoryFilters
                        filters={filters}
                        onFiltersChange={updateFilters}
                        onReset={resetFilters}
                    />

                    {/* Indicador de ordenamiento */}
                    <TouchableOpacity
                        style={[styles.sortButton, { backgroundColor: colors.surface }]}
                        onPress={() => updateFilters({
                            sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc'
                        })}
                    >
                        <Ionicons
                            name={filters.sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                            size={16}
                            color={colors.text}
                        />
                        <Text style={[styles.sortText, { color: colors.text }]}>
                            {filters.sortOrder === 'desc' ? 'Recientes' : 'Antiguos'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    };

    // Renderizar footer con botón "Ver Todo" (solo en vista compacta)
    const renderFooter = () => {
        if (!maxItems || !onSeeAll) return null;

        return (
            <TouchableOpacity
                style={[styles.seeAllButton, { backgroundColor: colors.surface }]}
                onPress={onSeeAll}
            >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                    Ver Todo el Historial
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
        );
    };

    // Vista compacta para el perfil
    if (maxItems) {
        return (
            <View style={styles.compactContainer}>
                {displayItems.length > 0 ? (
                    <>
                        {displayItems.map((item, index) => (
                            <View key={item.id} style={styles.compactItem}>
                                <View style={styles.compactItemContent}>
                                    <View style={[styles.compactIcon, { backgroundColor: getStatusColor(item.status) }]}>
                                        <Ionicons
                                            name={getItemIcon(item.type)}
                                            size={16}
                                            color="white"
                                        />
                                    </View>

                                    <View style={styles.compactTextContainer}>
                                        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.compactSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                                            {new Date(item.date).toLocaleDateString('es-MX')} • {item.subtitle}
                                        </Text>
                                    </View>

                                    {item.amount && (
                                        <Text style={[styles.compactAmount, { color: colors.text }]}>
                                            {formatCurrency(item.amount)}
                                        </Text>
                                    )}
                                </View>

                                {index < displayItems.length - 1 && (
                                    <View style={[styles.compactDivider, { backgroundColor: colors.textSecondary + '20' }]} />
                                )}
                            </View>
                        ))}
                        {renderFooter()}
                    </>
                ) : (
                    <View style={styles.emptyCompactContainer}>
                        <Text style={[styles.emptyCompactText, { color: colors.textSecondary }]}>
                            No hay historial disponible
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    // Vista completa
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {showTitle && (
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Mi Historial
                    </Text>
                </View>
            )}

            {renderStats()}
            {renderHeader()}

            <HistoryTimeline
                items={displayItems}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onLoadMore={loadMore}
                onItemPress={handleItemPress}
                emptyMessage="No hay elementos que coincidan con los filtros"
            />
        </SafeAreaView>
    );

    // Funciones auxiliares
    function getStatusColor(status: string): string {
        switch (status) {
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
    }

    function getItemIcon(type: string): any {
        switch (type) {
            case 'appointment':
                return 'calendar';
            case 'payment':
                return 'card';
            case 'service':
                return 'star';
            default:
                return 'time';
        }
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#f0f2f5',
        marginHorizontal: 16,
    },
    headerContainer: {
        marginBottom: 8,
    },
    filtersContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sortText: {
        fontSize: 14,
        marginLeft: 6,
    },

    // Estilos para vista compacta
    compactContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    compactItem: {
        paddingHorizontal: 16,
    },
    compactItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    compactIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    compactTextContainer: {
        flex: 1,
    },
    compactTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    compactSubtitle: {
        fontSize: 13,
    },
    compactAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    compactDivider: {
        height: 1,
        marginLeft: 44,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f2f5',
    },
    seeAllText: {
        fontSize: 15,
        fontWeight: '500',
        marginRight: 4,
    },
    emptyCompactContainer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyCompactText: {
        fontSize: 14,
    },
});
