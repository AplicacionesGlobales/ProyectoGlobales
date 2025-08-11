import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../ui/Input'; // Tu componente Input existente
import { useForgotPassword } from '../../../hooks/useForgotPassword';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const { forgotPassword, isLoading, error, isSuccess, reset } = useForgotPassword();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError(null);
    }
    if (error) {
      reset(); // Limpia errores del hook cuando el usuario empieza a escribir
    }
  };

  const handleSubmit = async () => {
    // Validaciones locales
    if (!email.trim()) {
      setEmailError('El correo electrónico es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setEmailError(null);
    
    const result = await forgotPassword(email);
    
    if (result && result.success) {
      onSuccess?.();
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  if (isSuccess) {
    return (
      <View>
        {/* Success Icon */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#10b981',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Ionicons name="checkmark" size={40} color="#ffffff" />
          </View>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            ¡Correo Enviado!
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 24,
          }}>
            Te hemos enviado un enlace para restablecer tu contraseña a{' '}
            <Text style={{ fontWeight: '600', color: '#3b82f6' }}>{email}</Text>
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 14,
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: 24,
          }}>
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
          </Text>
          
          <TouchableOpacity
            onPress={onBackToLogin}
            style={{
              borderWidth: 2,
              borderColor: '#3b82f6',
              borderRadius: 12,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
            <Text style={{
              color: '#3b82f6',
              fontSize: 17,
              fontWeight: '600',
            }}>
              Volver al Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View>
      {/* Form Header */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: 8,
          textAlign: 'center',
        }}>
          ¿Olvidaste tu contraseña?
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: 24,
        }}>
          No te preocupes, ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
        </Text>
      </View>

      {/* Email Input */}
      <View style={{ marginBottom: 24 }}>
        <Input
          label="Correo Electrónico"
          placeholder="correo@ejemplo.com"
          value={email}
          onChangeText={handleEmailChange}
          error={emailError || error}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          required
        />
      </View>

      {/* Action Buttons */}
      <View>
        {/* Send Reset Link Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!email.trim() || isLoading}
          style={{
            backgroundColor: !email.trim() || isLoading ? '#9ca3af' : '#3b82f6',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
            marginBottom: 16,
          }}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={22} color="#ffffff" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="mail" size={22} color="#ffffff" style={{ marginRight: 8 }} />
          )}
          <Text style={{
            color: '#ffffff',
            fontSize: 17,
            fontWeight: '600',
          }}>
            {isLoading ? 'Enviando...' : 'Enviar Enlace'}
          </Text>
        </TouchableOpacity>

        {/* Back to Login Button */}
        <TouchableOpacity
          onPress={onBackToLogin}
          style={{
            borderWidth: 2,
            borderColor: '#3b82f6',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
          <Text style={{
            color: '#3b82f6',
            fontSize: 17,
            fontWeight: '600',
          }}>
            Volver al Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};