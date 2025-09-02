import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileListItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    isLast?: boolean;
}

export const ProfileListItem: React.FC<ProfileListItemProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    isLast = false,
}) => {
    const Component = onPress ? TouchableOpacity : View;

    return (
        <Component style={styles.container} onPress={onPress}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon as any} size={24} color="#111418" />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && (
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    )}
                </View>

                {showArrow && onPress && (
                    <View style={styles.arrowContainer}>
                        <Ionicons name="chevron-forward" size={20} color="#60728a" />
                    </View>
                )}
            </View>

            {!isLast && <View style={styles.separator} />}
        </Component>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 60,
    },
    iconContainer: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111418',
        lineHeight: 20,
    },
    subtitle: {
        fontSize: 14,
        color: '#60728a',
        marginTop: 2,
        lineHeight: 18,
    },
    arrowContainer: {
        marginLeft: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f2f5',
        marginLeft: 60, // Alinear con el texto
    },
});
