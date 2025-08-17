// components/Auth/ForgotPassword/StepThree.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedInput from '../../ui/ThemedInput';
import ThemedButton from '../../ui/ThemedButton';
import { useResetPassword } from '../../../hooks/Auth/useResetPassword';

interface StepThreeProps {
  email: string;
  code: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const StepThree: React.FC<StepThreeProps> = ({ email, code, onSuccess, onBack }) => {
  const { colors } = useTheme();
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

  // Componente de requisito de contraseña
  const PasswordRequirement: React.FC<{ 
    met: boolean; 
    text: string; 
  }> = ({ met, text }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
      <Ionicons 
        name={met ? "checkmark-circle" : "ellipse-outline"} 
        size={16} 
        color={met ? colors.success : colors.textSecondary} 
        style={{ marginRight: 8 }} 
      />
      <Text style={{ 
        fontSize: 12, 
        color: met ? colors.success : colors.textSecondary 
      }}>
        {text}
      </Text>
    </View>
  );

  if (isSuccess) {
    return (
      <View>
        {/* Success Icon */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Ionicons name="checkmark" size={50} color="#ffffff" />
          </View>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            ¡Contraseña Actualizada!
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
          }}>
            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 24,
          }}>
            Te hemos enviado un email de confirmación con un código de emergencia por si necesitas ayuda adicional.
          </Text>
          
          <ThemedButton
            title="Ir al Login"
            variant="primary"
            size="medium"
            icon="log-in"
            onPress={onSuccess}
          />
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
          color: colors.text,
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Nueva Contraseña
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
        }}>
          Crea una nueva contraseña segura para tu cuenta.
        </Text>
      </View>

      {/* Password Requirements */}
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.textSecondary + '20',
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 8,
        }}>
          La contraseña debe contener:
        </Text>
        
        <PasswordRequirement
          met={password.length >= 8}
          text="Al menos 8 caracteres"
        />
        <PasswordRequirement
          met={/(?=.*[a-z])/.test(password)}
          text="Una letra minúscula"
        />
        <PasswordRequirement
          met={/(?=.*[A-Z])/.test(password)}
          text="Una letra mayúscula"
        />
        <PasswordRequirement
          met={/(?=.*\d)/.test(password)}
          text="Al menos un número"
        />
      </View>

      {/* Password Inputs */}
      <View style={{ marginBottom: 24 }}>
        <ThemedInput
          field="password"
          label="Nueva Contraseña"
          required
          icon="lock-closed-outline"
          placeholder="Ingresa tu nueva contraseña"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={password}
          onChangeText={handlePasswordChange}
          hasError={passwordError}
          showToggle
          isToggleVisible={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
        />
      </View>

      <View style={{ marginBottom: 32 }}>
        <ThemedInput
          field="confirmPassword"
          label="Confirmar Contraseña"
          required
          icon="lock-closed-outline"
          placeholder="Confirma tu nueva contraseña"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          hasError={confirmPasswordError}
          showToggle
          isToggleVisible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      </View>

      {/* Error Message */}
      {error && (
        <View style={{
          backgroundColor: colors.error + '10',
          borderColor: colors.error + '40',
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}>
          <Text style={{
            color: colors.error,
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
        <ThemedButton
          title={isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
          variant="primary"
          size="medium"
          icon={isLoading ? 'hourglass' : 'shield-checkmark'}
          loading={isLoading}
          disabled={!password || !confirmPassword || isLoading}
          onPress={handleSubmit}
          style={{ marginBottom: 16 }}
        />

        {/* Back Button */}
        <ThemedButton
          title="Volver"
          variant="ghost"
          size="medium"
          icon="arrow-back"
          onPress={onBack}
        />
      </View>
    </View>
  );
};