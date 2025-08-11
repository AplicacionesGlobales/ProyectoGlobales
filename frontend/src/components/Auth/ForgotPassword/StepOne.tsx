// components/Auth/ForgotPassword/StepOne.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../ui/Input';
import { useForgotPassword } from '../../../hooks/Auth/useForgotPassword';

interface StepOneProps {
  onNext: (email: string) => void;
  onBack: () => void;
}

export const StepOne: React.FC<StepOneProps> = ({ onNext, onBack }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const { forgotPassword, isLoading, error, reset } = useForgotPassword();

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
      reset();
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
    
    try {
      console.log('🔄 Enviando solicitud de reset para:', email);
      const result = await forgotPassword(email);
      console.log('📩 Respuesta del forgot password:', JSON.stringify(result, null, 2));
      
      // Si llegamos aquí, la respuesta fue exitosa (no se lanzó excepción)
      if (result && result.success === true) {
        console.log('✅ Avanzando al paso 2 - success true');
        onNext(email);
      } else {
        // Si no hay success explícito pero tampoco error, intentar avanzar
        console.log('⚠️ Avanzando al paso 2 - respuesta sin success explícito');
        onNext(email);
      }
    } catch (error) {
      // Los errores ya son manejados por el hook useForgotPassword
      console.log('❌ Error capturado en handleSubmit:', error);
    }
  };

  return (
    <View>
      {/* Header */}
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
          Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
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
        {/* Send Code Button */}
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
            {isLoading ? 'Enviando...' : 'Enviar Código'}
          </Text>
        </TouchableOpacity>

        {/* Back to Login Button */}
        <TouchableOpacity
          onPress={onBack}
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