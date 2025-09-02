import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClientProfile, EditProfileData } from '../../types/profile.types';

interface EditProfileModalProps {
    visible: boolean;
    profile: ClientProfile;
    onClose: () => void;
    onSave: (data: EditProfileData) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    profile,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState<EditProfileData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<EditProfileData>>({});

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone || '',
                notes: profile.notes || '',
            });
            setErrors({});
        }
    }, [profile]);

    const validateForm = (): boolean => {
        const newErrors: Partial<EditProfileData> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'El nombre es requerido';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'El apellido es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Teléfono debe tener 10 dígitos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            Alert.alert(
                'Error',
                'No se pudo actualizar el perfil. Intenta nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: keyof EditProfileData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const formatPhoneNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return cleaned;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Editar Perfil</Text>

                    <TouchableOpacity
                        onPress={handleSave}
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        disabled={loading}
                    >
                        <Text style={[styles.saveText, loading && styles.saveTextDisabled]}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                    {/* Nombre */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nombre *</Text>
                        <TextInput
                            style={[styles.input, errors.firstName && styles.inputError]}
                            value={formData.firstName}
                            onChangeText={(text) => updateFormData('firstName', text)}
                            placeholder="Ingresa tu nombre"
                            autoCapitalize="words"
                        />
                        {errors.firstName && (
                            <Text style={styles.errorText}>{errors.firstName}</Text>
                        )}
                    </View>

                    {/* Apellido */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Apellido *</Text>
                        <TextInput
                            style={[styles.input, errors.lastName && styles.inputError]}
                            value={formData.lastName}
                            onChangeText={(text) => updateFormData('lastName', text)}
                            placeholder="Ingresa tu apellido"
                            autoCapitalize="words"
                        />
                        {errors.lastName && (
                            <Text style={styles.errorText}>{errors.lastName}</Text>
                        )}
                    </View>

                    {/* Email */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            value={formData.email}
                            onChangeText={(text) => updateFormData('email', text)}
                            placeholder="ejemplo@correo.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}
                    </View>

                    {/* Teléfono */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Teléfono</Text>
                        <TextInput
                            style={[styles.input, errors.phone && styles.inputError]}
                            value={formatPhoneNumber(formData.phone || '')}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/\D/g, '');
                                updateFormData('phone', cleaned);
                            }}
                            placeholder="(555) 123-4567"
                            keyboardType="phone-pad"
                            maxLength={14}
                        />
                        {errors.phone && (
                            <Text style={styles.errorText}>{errors.phone}</Text>
                        )}
                    </View>

                    {/* Notas */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Notas</Text>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            value={formData.notes}
                            onChangeText={(text) => updateFormData('notes', text)}
                            placeholder="Información adicional..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f2f5',
    },
    cancelButton: {
        padding: 8,
    },
    cancelText: {
        color: '#1373f1',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111418',
    },
    saveButton: {
        padding: 8,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveText: {
        color: '#1373f1',
        fontSize: 16,
        fontWeight: '600',
    },
    saveTextDisabled: {
        color: '#60728a',
    },
    form: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111418',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#e0e4e7',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111418',
    },
    inputError: {
        borderColor: '#e74c3c',
    },
    notesInput: {
        height: 120,
        paddingTop: 12,
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 14,
        marginTop: 4,
    },
});
