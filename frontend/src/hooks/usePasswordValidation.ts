import { useState, useCallback, useEffect } from 'react';

export interface PasswordValidation {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  isValid: boolean;
  strength: number;
}

interface UsePasswordValidationReturn {
  validation: PasswordValidation;
  validatePassword: (password: string) => PasswordValidation;
  getStrengthColor: () => string;
  getStrengthText: () => string;
}

export const usePasswordValidation = (password: string = ''): UsePasswordValidationReturn => {
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    isValid: false,
    strength: 0,
  });

  const validatePassword = useCallback((pwd: string): PasswordValidation => {
    const minLength = pwd.length >= 6; // Cambiado de 8 a 6 según backend
    const hasLowercase = /[a-z]/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    
    const isValid = minLength && hasLowercase && hasUppercase && hasNumber;
    
    // Calcular fuerza basada en nuestras reglas
    let strength = 0;
    if (minLength) strength += 25;
    if (hasLowercase) strength += 25;
    if (hasUppercase) strength += 25;
    if (hasNumber) strength += 25;
    
    const result: PasswordValidation = {
      minLength,
      hasLowercase,
      hasUppercase,
      hasNumber,
      isValid,
      strength,
    };

    return result;
  }, []);

  const getStrengthColor = useCallback(() => {
    if (validation.strength < 50) return '#ef4444'; // Red
    if (validation.strength < 75) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  }, [validation.strength]);

  const getStrengthText = useCallback(() => {
    if (validation.strength < 50) return 'Weak';
    if (validation.strength < 75) return 'Medium';
    return 'Strong';
  }, [validation.strength]);

  useEffect(() => {
    setValidation(validatePassword(password));
  }, [password, validatePassword]);

  return {
    validation,
    validatePassword,
    getStrengthColor,
    getStrengthText,
  };
};
