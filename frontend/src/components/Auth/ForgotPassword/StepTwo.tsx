// components/Auth/ForgotPassword/StepTwo.tsx (Actualizado)
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForgotPassword } from '../../../hooks/Auth/useForgotPassword';
import { useValidateResetCode} from '../../../hooks/Auth/useValidateResetCode';

interface StepTwoProps {
  email: string;
  onNext: (code: string) => void; // Ahora pasa el código validado
  onBack: () => void;
}

export const StepTwo: React.FC<StepTwoProps> = ({ email, onNext, onBack }) => {
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
      // Pasar el código validado al siguiente paso
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
          color: '#1f2937',
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Ingresa el Código
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: 24,
        }}>
          Hemos enviado un código de 6 dígitos a{' '}
          <Text style={{ fontWeight: '600', color: '#3b82f6' }}>{email}</Text>
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
                borderColor: error ? '#ef4444' : (digit ? '#3b82f6' : '#e5e7eb'),
                borderRadius: 12,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                backgroundColor: '#ffffff',
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
            color: '#ef4444',
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
          color: timer > 0 ? '#6b7280' : '#ef4444',
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
        <TouchableOpacity
          onPress={() => handleValidateCode()}
          disabled={code.join('').length !== 6 || isLoading}
          style={{
            backgroundColor: code.join('').length !== 6 || isLoading ? '#9ca3af' : '#3b82f6',
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
            <Ionicons name="checkmark-circle" size={22} color="#ffffff" style={{ marginRight: 8 }} />
          )}
          <Text style={{
            color: '#ffffff',
            fontSize: 17,
            fontWeight: '600',
          }}>
            {isLoading ? 'Verificando...' : 'Verificar Código'}
          </Text>
        </TouchableOpacity>

        {/* Resend Code Button */}
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={isResending || timer > 840} // Solo permitir reenvío después de 1 minuto
          style={{
            borderWidth: 2,
            borderColor: isResending || timer > 840 ? '#9ca3af' : '#10b981',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          {isResending ? (
            <Ionicons name="hourglass" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="refresh" size={20} color={timer > 840 ? '#9ca3af' : '#10b981'} style={{ marginRight: 8 }} />
          )}
          <Text style={{
            color: isResending || timer > 840 ? '#9ca3af' : '#10b981',
            fontSize: 17,
            fontWeight: '600',
          }}>
            {isResending ? 'Enviando...' : 'Reenviar Código'}
          </Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          onPress={onBack}
          style={{
            borderWidth: 2,
            borderColor: '#6b7280',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#6b7280" style={{ marginRight: 8 }} />
          <Text style={{
            color: '#6b7280',
            fontSize: 17,
            fontWeight: '600',
          }}>
            Cambiar Email
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};