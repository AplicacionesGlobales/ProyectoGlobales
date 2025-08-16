import { useState, useEffect, useCallback, useRef } from 'react';
import { validationService, ValidationResponse } from '../services/validation.service';

export interface UseValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
  required?: boolean;
  minLength?: number;
}

interface ValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
  touched: boolean;
}

export function useValidation(
  type: 'email' | 'username',
  value: string,
  options: UseValidationOptions = {}
) {
  const { debounceMs = 500, validateOnMount = false, required = false, minLength = 0 } = options;
  
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    isValid: null,
    error: null,
    touched: false
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Client-side validation
  const validateClientSide = useCallback((val: string): string | null => {
    if (required && !val.trim()) {
      return `${type === 'email' ? 'El email' : 'El username'} es requerido`;
    }
    
    if (val && minLength > 0 && val.length < minLength) {
      return `Debe tener al menos ${minLength} caracteres`;
    }
    
    if (type === 'email' && val) {
      // Regex más permisiva para emails válidos
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) {
        return 'Formato de email inválido';
      }
    }
    
    if (type === 'username' && val) {
      if (val.length < 3) {
        return 'El username debe tener al menos 3 caracteres';
      }
      // Permitir letras, números y guiones bajos
      if (!/^[a-zA-Z0-9_]+$/.test(val)) {
        return 'Solo se permiten letras, números y guiones bajos';
      }
    }
    
    return null;
  }, [type, required, minLength]);

  // Server-side validation
  const validateServerSide = useCallback(async (val: string) => {
    if (!val || !mountedRef.current) return;

    const clientError = validateClientSide(val);
    if (clientError) return;

    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      console.log(`🔍 Validating ${type}:`, val);
      
      const result: ValidationResponse = type === 'email' 
        ? await validationService.validateEmail(val)
        : await validationService.validateUsername(val);

      console.log(`✅ ${type} validation result:`, result);

      if (!mountedRef.current) return;

      if (result.success) {
        setState(prev => ({
          ...prev,
          isValidating: false,
          isValid: result.data.isAvailable,
          error: result.data.isAvailable ? null : `Este ${type} ya está en uso`
        }));
      } else {
        setState(prev => ({
          ...prev,
          isValidating: false,
          isValid: false,
          error: result.errors?.[0]?.description || `Error al validar ${type}`
        }));
      }
    } catch (error) {
      console.error(`❌ ${type} validation error:`, error);
      
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        isValid: false,
        error: 'Error de conexión'
      }));
    }
  }, [type, validateClientSide]);

  // Main validation effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const clientError = validateClientSide(value);
    
    if (clientError) {
      setState(prev => ({
        ...prev,
        isValidating: false,
        isValid: false,
        error: clientError
      }));
      return;
    }

    if (!value) {
      setState(prev => ({
        ...prev,
        isValidating: false,
        isValid: null,
        error: null
      }));
      return;
    }

    if (state.touched || validateOnMount) {
      timeoutRef.current = setTimeout(() => {
        validateServerSide(value);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, validateClientSide, validateServerSide, debounceMs, validateOnMount, state.touched]);

  const markAsTouched = useCallback(() => {
    setState(prev => ({ ...prev, touched: true }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isValidating: false,
      isValid: null,
      error: null,
      touched: false
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    markAsTouched,
    reset,
    hasError: state.touched && !!state.error,
    isValidAndTouched: state.touched && state.isValid === true,
    shouldShowValidation: state.touched && !state.isValidating
  };
}