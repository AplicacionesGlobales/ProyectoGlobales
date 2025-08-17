// components/Auth/ForgotPassword/StepTwo.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedButton from '../../ui/ThemedButton';
import { useForgotPassword } from '../../../hooks/Auth/useForgotPassword';
import { useValidateResetCode } from '../../../hooks/Auth/useValidateResetCode';

interface StepTwoProps {
  email: string;
  onNext: (code: string) => void;
  onBack: () => void;
}

export const StepTwo: React.FC<StepTwoProps> = ({ email, onNext, onBack }) => {
  const { colors } = useTheme();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(900); // 15 minutos en segundos
  
  const { validateCode, isLoading, error: validateError, reset } = useValidateResetCode();
  const { forgotPassword, isLoading: isResending } = useForgotPassword();
  
  const inputRefs = useRef<TextInput[]>([]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (value: string, index: number) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (error) {
      setError(null);
    }
    if (validateError) {
      reset();
    }

    // Auto-focus siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit cuando se completa el código
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        setTimeout(() => handleValidateCode(fullCode), 100);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleValidateCode = async (codeToValidate?: string) => {
    const fullCode = codeToValidate || code.join('');
    
    if (fullCode.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setError(null);
    
    const result = await validateCode(fullCode, email);
    
    if (result && result.valid) {
      onNext(fullCode);
    } else {
      const errorMessage = result?.message || validateError || 'Código inválido';
      setError(errorMessage);
      
      // Limpiar código si es inválido
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    const result = await forgotPassword(email);
    if (result && result.success) {
      setTimer(900); // Reiniciar timer
      setCode(['', '', '', '', '', '']);
      setError(null);
      inputRefs.current[0]?.focus();
      Alert.alert('Código Reenviado', 'Te hemos enviado un nuevo código a tu correo electrónico.');
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
          Ingresa el Código
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
        }}>
          Hemos enviado un código de 6 dígitos a{' '}
          <Text style={{ fontWeight: '600', color: colors.primary }}>{email}</Text>
        </Text>
      </View>

      {/* Code Input */}
      <View style={{ marginBottom: 24 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={{
                width: 45,
                height: 55,
                borderWidth: 2,
                borderColor: error ? colors.error : (digit ? colors.primary : colors.textSecondary + '40'),
                borderRadius: 12,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                backgroundColor: colors.surface,
                color: colors.text,
              }}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Error Message */}
        {(error || validateError) && (
          <Text style={{
            color: colors.error,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 16,
          }}>
            {error || validateError}
          </Text>
        )}

        {/* Timer */}
        <Text style={{
          fontSize: 14,
          color: timer > 0 ? colors.textSecondary : colors.error,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          {timer > 0 
            ? `El código expira en ${formatTime(timer)}`
            : 'El código ha expirado'
          }
        </Text>
      </View>

      {/* Action Buttons */}
      <View>
        {/* Validate Button */}
        <ThemedButton
          title={isLoading ? 'Verificando...' : 'Verificar Código'}
          variant="primary"
          size="medium"
          icon={isLoading ? 'hourglass' : 'checkmark-circle'}
          loading={isLoading}
          disabled={code.join('').length !== 6 || isLoading}
          onPress={() => handleValidateCode()}
          style={{ marginBottom: 16 }}
        />

        {/* Resend Code Button */}
        <ThemedButton
          title={isResending ? 'Enviando...' : 'Reenviar Código'}
          variant="outline"
          size="medium"
          icon={isResending ? 'hourglass' : 'refresh'}
          loading={isResending}
          disabled={isResending || timer > 840}
          onPress={handleResendCode}
          style={{ 
            marginBottom: 16,
            borderColor: isResending || timer > 840 ? colors.textSecondary : colors.success,
          }}
        />

        {/* Back Button */}
        <ThemedButton
          title="Cambiar Email"
          variant="ghost"
          size="medium"
          icon="arrow-back"
          onPress={onBack}
        />
      </View>
    </View>
  );
};