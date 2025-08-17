// components/register/RegisterForm.tsx
import React, { useRef } from 'react';
import { View, Text, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedInput from '../../ui/ThemedInput';
import ThemedButton from '../../ui/ThemedButton';
import TermsCheckbox from './TermsCheckbox';
import { EmailValidationIndicator } from '../EmailValidationIndicator';
import { UsernameValidationIndicator } from '../UsernameValidationIndicator';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator';

const StyledView = styled(View);
const StyledText = styled(Text);

interface RegisterFormProps {
  // Form data
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  
  // UI states
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  validationErrors: Record<string, string | null>;
  setValidationErrors: (errors: Record<string, string | null>) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  loading: boolean;
  
  // Validation states
  isValidatingEmail: boolean;
  isEmailAvailable: boolean | null;
  isValidatingUsername: boolean;
  isUsernameAvailable: boolean | null;
  passwordValidation: any;
  
  // Handlers
  onRegister: () => void;
  debouncedValidation: (field: string, value: string, additionalValue?: string) => void;
  validateField: (field: string, value: string) => string | null;
  validateEmailRealtime: (email: string) => void;
  validateUsernameRealtime: (username: string) => void;
  clearEmailValidation: () => void;
  clearUsernameValidation: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  firstName, setFirstName,
  lastName, setLastName,
  email, setEmail,
  username, setUsername,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword,
  focusedField, setFocusedField,
  validationErrors, setValidationErrors,
  termsAccepted, setTermsAccepted,
  loading,
  isValidatingEmail, isEmailAvailable,
  isValidatingUsername, isUsernameAvailable,
  passwordValidation,
  onRegister,
  debouncedValidation, validateField,
  validateEmailRealtime, validateUsernameRealtime,
  clearEmailValidation, clearUsernameValidation,
}) => {
  const { colors } = useTheme();
  
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const getFieldRef = (field: string) => {
    switch (field) {
      case 'firstName': return firstNameInputRef;
      case 'lastName': return lastNameInputRef;
      case 'email': return emailInputRef;
      case 'username': return usernameInputRef;
      case 'password': return passwordInputRef;
      case 'confirmPassword': return confirmPasswordInputRef;
      default: return null;
    }
  };

  const handleFieldChange = (
    field: string, 
    value: string, 
    setter: (value: string) => void
  ) => {
    setter(value);
    
    // Real-time email validation
    if (field === 'email') {
      clearEmailValidation();
      validateEmailRealtime(value);
    }
    
    // Real-time username validation
    if (field === 'username') {
      clearUsernameValidation();
      validateUsernameRealtime(value);
    }
    
    // Debounced validation for real-time feedback
    if (field === 'confirmPassword') {
      debouncedValidation(field, value, password);
    } else {
      debouncedValidation(field, value);
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    setFocusedField(null);
    validateField(field, value);
  };

  // Determinar validez para email y username considerando disponibilidad
  const isEmailValid = !!(email && !validationErrors.email && !focusedField && isEmailAvailable !== false);
  const isUsernameValid = !!(username && !validationErrors.username && !focusedField && isUsernameAvailable !== false);

  return (
    <StyledView style={{
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    }}>
      {/* Name Row */}
      <StyledView style={{ flexDirection: 'row', gap: 12 }}>
        <ThemedInput
          ref={firstNameInputRef}
          field="firstName"
          label="First Name"
          required
          icon="person-outline"
          placeholder="John"
          autoCapitalize="words"
          autoCorrect={false}
          value={firstName}
          onChangeText={(text) => handleFieldChange('firstName', text, setFirstName)}
          onFocus={() => setFocusedField('firstName')}
          onBlur={() => handleFieldBlur('firstName', firstName)}
          isFocused={focusedField === 'firstName'}
          hasError={validationErrors.firstName}
          containerStyle={{ flex: 1 }}
        />
        
        <ThemedInput
          ref={lastNameInputRef}
          field="lastName"
          label="Last Name"
          required
          icon="person-outline"
          placeholder="Doe"
          autoCapitalize="words"
          autoCorrect={false}
          value={lastName}
          onChangeText={(text) => handleFieldChange('lastName', text, setLastName)}
          onFocus={() => setFocusedField('lastName')}
          onBlur={() => handleFieldBlur('lastName', lastName)}
          isFocused={focusedField === 'lastName'}
          hasError={validationErrors.lastName}
          containerStyle={{ flex: 1 }}
        />
      </StyledView>

      {/* Email */}
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
        isValid={isEmailValid}
        validationComponent={
          <EmailValidationIndicator
            isValidating={isValidatingEmail}
            isAvailable={isEmailAvailable}
            email={email}
          />
        }
      />

      {/* Username */}
      <ThemedInput
        ref={usernameInputRef}
        field="username"
        label="Username"
        required
        icon="at"
        placeholder="johndoe"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={(text) => handleFieldChange('username', text, setUsername)}
        onFocus={() => setFocusedField('username')}
        onBlur={() => handleFieldBlur('username', username)}
        isFocused={focusedField === 'username'}
        hasError={validationErrors.username}
        isValid={isUsernameValid}
        validationComponent={
          <UsernameValidationIndicator
            isValidating={isValidatingUsername}
            isAvailable={isUsernameAvailable}
            username={username}
          />
        }
      />

      {/* Password */}
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
        validationComponent={
          password && (
            <PasswordStrengthIndicator
              validation={passwordValidation.validation}
              password={password}
              strengthColor={passwordValidation.getStrengthColor()}
              strengthText={passwordValidation.getStrengthText()}
            />
          )
        }
      />

      {/* Confirm Password */}
      <ThemedInput
        ref={confirmPasswordInputRef}
        field="confirmPassword"
        label="Confirm Password"
        required
        icon="lock-closed-outline"
        placeholder="••••••••"
        secureTextEntry={!showConfirmPassword}
        value={confirmPassword}
        onChangeText={(text) => handleFieldChange('confirmPassword', text, setConfirmPassword)}
        onFocus={() => setFocusedField('confirmPassword')}
        onBlur={() => handleFieldBlur('confirmPassword', confirmPassword)}
        isFocused={focusedField === 'confirmPassword'}
        hasError={validationErrors.confirmPassword}
        showToggle
        isToggleVisible={showConfirmPassword}
        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      {/* Terms and Conditions */}
      <TermsCheckbox
        checked={termsAccepted}
        onToggle={() => setTermsAccepted(!termsAccepted)}
      />

      {/* Submit Button */}
      <ThemedButton
        title="Create My Account"
        variant="primary"
        size="medium"
        icon="rocket"
        loading={loading}
        disabled={loading}
        onPress={onRegister}
        style={{ marginTop: 4 }}
      />
    </StyledView>
  );
};

export default RegisterForm;