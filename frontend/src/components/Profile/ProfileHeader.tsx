import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClientProfile } from '../../types/profile.types';

interface ProfileHeaderProps {
    profile: ClientProfile;
    onEdit: () => void;
    onSettings: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    profile,
    onEdit,
    onSettings,
}) => {
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatMemberSince = (date: string) => {
        try {
            const memberDate = new Date(date);
            return `Miembro desde ${memberDate.getFullYear()}`;
        } catch {
            return 'Miembro desde 2024';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header with settings button */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Perfil</Text>
                <TouchableOpacity style={styles.settingsButton} onPress={onSettings}>
                    <Ionicons name="settings-outline" size={24} color="#111418" />
                </TouchableOpacity>
            </View>

            {/* Profile content */}
            <View style={styles.profileContent}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {profile.avatar ? (
                        <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {getInitials(profile.firstName, profile.lastName)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Profile info */}
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                        {profile.firstName} {profile.lastName}
                    </Text>
                    <Text style={styles.profileStatus}>
                        {profile.isActive ? 'Activo' : 'Inactivo'}
                    </Text>
                    <Text style={styles.memberSince}>
                        {formatMemberSince(profile.memberSince)}
                    </Text>
                </View>

                {/* Edit button */}
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                    <Ionicons name="pencil" size={16} color="#1373f1" />
                    <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111418',
        flex: 1,
        textAlign: 'center',
        marginLeft: 48, // Compensar el botón de settings
    },
    settingsButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 128,
        height: 128,
        borderRadius: 64,
    },
    avatarPlaceholder: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#1373f1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 48,
        fontWeight: 'bold',
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111418',
        marginBottom: 4,
    },
    profileStatus: {
        fontSize: 16,
        color: '#60728a',
        marginBottom: 2,
    },
    memberSince: {
        fontSize: 16,
        color: '#60728a',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    editButtonText: {
        color: '#1373f1',
        fontSize: 14,
        fontWeight: '600',
    },
});
