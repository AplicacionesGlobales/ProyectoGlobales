// components/login/LoginForm.tsx
import React, { useRef } from 'react';
import { View, Text, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedInput from '../../ui/ThemedInput';
import ThemedButton from '../../ui/ThemedButton';
import RememberMeCheckbox from './RememberMeCheckbox';

const StyledView = styled(View);
const StyledText = styled(Text);

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  validationErrors: Record<string, string | null>;
  setValidationErrors: (errors: Record<string, string | null>) => void;
  loading: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  debouncedValidation: (field: string, value: string) => void;
  validateField: (field: string, value: string) => string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  focusedField,
  setFocusedField,
  validationErrors,
  setValidationErrors,
  loading,
  onLogin,
  onRegister,
  onForgotPassword,
  debouncedValidation,
  validateField,
}) => {
  const { colors } = useTheme();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleFieldChange = (field: string, value: string, setter: (value: string) => void) => {
    setter(value);
    
    // Use debounced validation for real-time feedback
    debouncedValidation(field, value);
  };

  const handleFieldBlur = (field: string, value: string) => {
    setFocusedField(null);
    validateField(field, value);
  };

  return (
    <StyledView style={{
      padding: 24,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      borderRadius: 24,
    }}>
      {/* Form Title */}
      <StyledText style={{
        marginBottom: 24,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.text,
      }}>
        Welcome Back!
      </StyledText>

      {/* Email Input */}
      <ThemedInput
        ref={emailInputRef}
        field="email"
        label="Email Address"
        required
        icon="mail-outline"
        placeholder="john@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={(text) => handleFieldChange('email', text, setEmail)}
        onFocus={() => setFocusedField('email')}
        onBlur={() => handleFieldBlur('email', email)}
        isFocused={focusedField === 'email'}
        hasError={validationErrors.email}
      />

      {/* Password Input */}
      <ThemedInput
        ref={passwordInputRef}
        field="password"
        label="Password"
        required
        icon="lock-closed-outline"
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={(text) => handleFieldChange('password', text, setPassword)}
        onFocus={() => setFocusedField('password')}
        onBlur={() => handleFieldBlur('password', password)}
        isFocused={focusedField === 'password'}
        hasError={validationErrors.password}
        showToggle
        isToggleVisible={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
      />

      {/* Remember Me & Forgot Password */}
      <StyledView style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <RememberMeCheckbox
          checked={rememberMe}
          onToggle={() => setRememberMe(!rememberMe)}
        />

        <ThemedButton
          title="Forgot password?"
          variant="ghost"
          size="small"
          fullWidth={false}
          onPress={onForgotPassword}
        />
      </StyledView>

      {/* Login Button */}
      <ThemedButton
        title="Sign In"
        variant="primary"
        size="medium"
        icon="log-in-outline"
        loading={loading}
        disabled={loading}
        onPress={onLogin}
        style={{ marginBottom: 16 }}
      />

      {/* Register Button */}
      <ThemedButton
        title="Create New Account"
        variant="outline"
        size="medium"
        icon="person-add-outline"
        onPress={onRegister}
      />
    </StyledView>
  );
};

export default LoginForm;