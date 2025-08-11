// components/Auth/ForgotPassword/StepThree.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../ui/Input';
import { useResetPassword } from '../../../hooks/Auth/useResetPassword';

interface StepThreeProps {
  email: string;
  code: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const StepThree: React.FC<StepThreeProps> = ({ email, code, onSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { resetPassword, isLoading, error, isSuccess, reset } = useResetPassword();

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'La contraseña es requerida';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    return null;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError(null);
    }
    if (error) {
      reset();
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      setConfirmPasswordError(null);
    }
    if (error) {
      reset();
    }
  };

  const handleSubmit = async () => {
    // Validaciones locales
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('La confirmación de contraseña es requerida');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      return;
    }

    setPasswordError(null);
    setConfirmPasswordError(null);
    
    const result = await resetPassword(code, email, password, confirmPassword);
    
    if (result && result.success) {
      onSuccess();
    }
  };

  if (isSuccess) {
    return (
      <View>
        {/* Success Icon */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#10b981',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Ionicons name="checkmark" size={50} color="#ffffff" />
          </View>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            ¡Contraseña Actualizada!
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 24,
          }}>
            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 14,
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: 24,
          }}>
            Te hemos enviado un email de confirmación con un código de emergencia por si necesitas ayuda adicional.
          </Text>
          
          <TouchableOpacity
            onPress={onSuccess}
            style={{
              backgroundColor: '#3b82f6',
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
            }}
          >
            <Ionicons name="log-in" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={{
              color: '#ffffff',
              fontSize: 17,
              fontWeight: '600',
            }}>
              Ir al Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          Nueva Contraseña
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: 24,
        }}>
          Crea una nueva contraseña segura para tu cuenta.
        </Text>
      </View>

      {/* Password Requirements */}
      <View style={{
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 8,
        }}>
          La contraseña debe contener:
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons 
            name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={password.length >= 8 ? "#10b981" : "#9ca3af"} 
            style={{ marginRight: 8 }} 
          />
          <Text style={{ 
            fontSize: 12, 
            color: password.length >= 8 ? "#10b981" : "#6b7280" 
          }}>
            Al menos 8 caracteres
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons 
            name={/(?=.*[a-z])/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={/(?=.*[a-z])/.test(password) ? "#10b981" : "#9ca3af"} 
            style={{ marginRight: 8 }} 
          />
          <Text style={{ 
            fontSize: 12, 
            color: /(?=.*[a-z])/.test(password) ? "#10b981" : "#6b7280" 
          }}>
            Una letra minúscula
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons 
            name={/(?=.*[A-Z])/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={/(?=.*[A-Z])/.test(password) ? "#10b981" : "#9ca3af"} 
            style={{ marginRight: 8 }} 
          />
          <Text style={{ 
            fontSize: 12, 
            color: /(?=.*[A-Z])/.test(password) ? "#10b981" : "#6b7280" 
          }}>
            Una letra mayúscula
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons 
            name={/(?=.*\d)/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={/(?=.*\d)/.test(password) ? "#10b981" : "#9ca3af"} 
            style={{ marginRight: 8 }} 
          />
          <Text style={{ 
            fontSize: 12, 
            color: /(?=.*\d)/.test(password) ? "#10b981" : "#6b7280" 
          }}>
            Al menos un número
          </Text>
        </View>
      </View>

      {/* Password Inputs */}
      <View style={{ marginBottom: 24 }}>
        <Input
          label="Nueva Contraseña"
          placeholder="Ingresa tu nueva contraseña"
          value={password}
          onChangeText={handlePasswordChange}
          error={passwordError}
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          autoCapitalize="none"
          required
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#6b7280" 
              />
            </TouchableOpacity>
          }
        />
      </View>

      <View style={{ marginBottom: 32 }}>
        <Input
          label="Confirmar Contraseña"
          placeholder="Confirma tu nueva contraseña"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          error={confirmPasswordError}
          secureTextEntry={!showConfirmPassword}
          textContentType="newPassword"
          autoCapitalize="none"
          required
          rightIcon={
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#6b7280" 
              />
            </TouchableOpacity>
          }
        />
      </View>

      {/* Error Message */}
      {error && (
        <View style={{
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}>
          <Text style={{
            color: '#ef4444',
            fontSize: 14,
            textAlign: 'center',
          }}>
            {error}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View>
        {/* Update Password Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!password || !confirmPassword || isLoading}
          style={{
            backgroundColor: !password || !confirmPassword || isLoading ? '#9ca3af' : '#3b82f6',
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
            <Ionicons name="shield-checkmark" size={22} color="#ffffff" style={{ marginRight: 8 }} />
          )}
          <Text style={{
            color: '#ffffff',
            fontSize: 17,
            fontWeight: '600',
          }}>
            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
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
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};