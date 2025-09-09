import React from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { HistoryItem as HistoryItemType } from '../../types/history.types';
import { HistoryItem } from './HistoryItem';
import { useTheme } from '../../contexts/ThemeContext';

interface HistoryTimelineProps {
    items: HistoryItemType[];
    loading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    onItemPress?: (item: HistoryItemType) => void;
    emptyMessage?: string;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
    items,
    loading = false,
    refreshing = false,
    onRefresh,
    onLoadMore,
    onItemPress,
    emptyMessage = 'No hay historial disponible',
}) => {
    const { colors } = useTheme();

    // Renderizar item del timeline
    const renderItem = ({ item, index }: { item: HistoryItemType; index: number }) => (
        <View style={styles.itemContainer}>
            <HistoryItem
                item={item}
                onPress={onItemPress}
                showDetails={false}
            />
            {/* Línea del timeline para conectar items */}
            {index < items.length - 1 && (
                <View style={[styles.timelineConnector, { backgroundColor: colors.textSecondary }]} />
            )}
        </View>
    );

    // Renderizar separador de fecha
    const renderSectionHeader = (date: string) => (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <View style={[styles.sectionLine, { backgroundColor: colors.textSecondary }]} />
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                {formatSectionDate(date)}
            </Text>
            <View style={[styles.sectionLine, { backgroundColor: colors.textSecondary }]} />
        </View>
    );

    // Formatear fecha para sección
    const formatSectionDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (itemDate.getTime() === today.getTime()) {
            return 'Hoy';
        } else if (itemDate.getTime() === yesterday.getTime()) {
            return 'Ayer';
        } else if (now.getTime() - itemDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString('es-MX', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        }
    };

    // Agrupar items por fecha
    const groupItemsByDate = (items: HistoryItemType[]) => {
        const grouped: { date: string; items: HistoryItemType[] }[] = [];
        let currentDate = '';
        let currentGroup: HistoryItemType[] = [];

        items.forEach(item => {
            const itemDate = new Date(item.date).toDateString();

            if (itemDate !== currentDate) {
                if (currentGroup.length > 0) {
                    grouped.push({ date: currentDate, items: currentGroup });
                }
                currentDate = itemDate;
                currentGroup = [item];
            } else {
                currentGroup.push(item);
            }
        });

        if (currentGroup.length > 0) {
            grouped.push({ date: currentDate, items: currentGroup });
        }

        return grouped;
    };

    // Renderizar lista con agrupación por fecha
    const renderGroupedTimeline = () => {
        const groupedItems = groupItemsByDate(items);

        return (
            <FlatList
                data={groupedItems}
                keyExtractor={(item, index) => `${item.date}-${index}`}
                renderItem={({ item: group }) => (
                    <View>
                        {renderSectionHeader(group.date)}
                        {group.items.map((item, index) => (
                            <View key={item.id}>
                                <HistoryItem
                                    item={item}
                                    onPress={onItemPress}
                                    showDetails={false}
                                />
                                {/* Línea conectora entre items del mismo día */}
                                {index < group.items.length - 1 && (
                                    <View style={[styles.timelineConnector, { backgroundColor: colors.textSecondary }]} />
                                )}
                            </View>
                        ))}
                    </View>
                )}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    ) : undefined
                }
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {emptyMessage}
                            </Text>
                        </View>
                    ) : null
                }
            />
        );
    };

    return <View style={styles.timelineContainer}>{renderGroupedTimeline()}</View>;
};

const styles = StyleSheet.create({
    timelineContainer: {
        flex: 1,
    },
    container: {
        paddingVertical: 16,
        flexGrow: 1,
    },
    itemContainer: {
        position: 'relative',
    },
    timelineConnector: {
        position: 'absolute',
        left: 32, // Alinear con el ícono del timeline
        top: 80, // Ajustar según la altura del item
        width: 2,
        height: 20,
        opacity: 0.3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        marginHorizontal: 16,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        opacity: 0.3,
    },
    sectionText: {
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 16,
        textTransform: 'capitalize',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
