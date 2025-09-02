import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileSectionProps {
    title: string;
    children: React.ReactNode;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
    title,
    children,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111418',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    content: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
    },
});
