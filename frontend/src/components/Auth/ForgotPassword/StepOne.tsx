// components/Auth/ForgotPassword/StepOne.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedInput from '../../ui/ThemedInput';
import ThemedButton from '../../ui/ThemedButton';
import { useForgotPassword } from '../../../hooks/Auth/useForgotPassword';

interface StepOneProps {
  onNext: (email: string) => void;
  onBack: () => void;
}

export const StepOne: React.FC<StepOneProps> = ({ onNext, onBack }) => {
  const { colors } = useTheme();
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
      
      if (result && result.success === true) {
        console.log('✅ Avanzando al paso 2 - success true');
        onNext(email);
      } else {
        console.log('⚠️ Avanzando al paso 2 - respuesta sin success explícito');
        onNext(email);
      }
    } catch (error) {
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
          color: colors.text,
          marginBottom: 8,
          textAlign: 'center',
        }}>
          ¿Olvidaste tu contraseña?
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
        }}>
          Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
        </Text>
      </View>

      {/* Email Input */}
      <View style={{ marginBottom: 24 }}>
        <ThemedInput
          field="email"
          label="Correo Electrónico"
          required
          icon="mail-outline"
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={handleEmailChange}
          hasError={emailError || error}
        />
      </View>

      {/* Action Buttons */}
      <View>
        {/* Send Code Button */}
        <ThemedButton
          title={isLoading ? 'Enviando...' : 'Enviar Código'}
          variant="primary"
          size="medium"
          icon={isLoading ? 'hourglass' : 'mail'}
          loading={isLoading}
          disabled={!email.trim() || isLoading}
          onPress={handleSubmit}
          style={{ marginBottom: 16 }}
        />

        {/* Back to Login Button */}
        <ThemedButton
          title="Volver al Login"
          variant="outline"
          size="medium"
          icon="arrow-back"
          onPress={onBack}
        />
      </View>
    </View>
  );
};