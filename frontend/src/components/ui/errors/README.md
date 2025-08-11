# Quick Guide to Using the Error Message System

### Use the hooks to trigger messages
    useError() for general messages (toast, banner, modal, validations).
    useErrorHandling() for specialized network and API error handling.

### Choose the right component for the context
    InlineError → For form errors, right next to the field.
    ToastError → For temporary messages and quick confirmations.
    BannerError → For persistent alerts on screen, like connection warnings.
    ModalError → For blocking, critical errors requiring user action.


# Error Message System

A comprehensive, reusable error message component system with different types, clear iconography, accessible design, and advanced validation capabilities.

## Features

- **Multiple Error Types**: `error`, `warning`, `info`, `success`, `validation`
- **Different Components**: InlineError, ToastError, BannerError, ModalError
- **Accessibility**: Full screen reader support, haptic feedback, keyboard navigation
- **Responsive Design**: Works on all screen sizes and orientations
- **Theme Support**: Light and dark mode compatible
- **TypeScript**: Fully typed for better development experience
- **Animations**: Smooth enter/exit animations with multiple presets
- **Global Management**: Context-based error state management
- **Advanced Validation**: Synchronous validation utilities with race condition prevention
- **Field Focusing**: Automatic focus management for form errors
- **Debounced Validation**: Real-time validation with performance optimization
- **Server Error Mapping**: Intelligent mapping of API errors to form fields
- **Haptic Feedback**: Platform-specific haptic responses for different error types

## Quick Start

### 1. Setup Error Provider

Wrap your app with the ErrorProvider:

```tsx
import { ErrorProvider, ErrorContainer } from '@/components/ui/errors';

export default function App() {
  return (
    <ErrorProvider>
      <YourAppContent />
      <ErrorContainer />
    </ErrorProvider>
  );
}
```

### 2. Use Error Hooks and Advanced Validation

```tsx
import { useError, useToast, useErrorHandling } from '@/components/ui/errors';
import { ErrorUtils } from '@/utils/ErrorUtils';

function MyComponent() {
  const { showToast, showBanner, showModal, showValidationErrors } = useError();
  const { showApiError, showNetworkError } = useErrorHandling();

  // Advanced form validation with race condition prevention
  const handleFormSubmit = async (formData: any) => {
    // Synchronous validation - no race conditions
    const errors = ErrorUtils.validateRegistrationForm(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.username,
      formData.password,
      formData.confirmPassword
    );

    // Check if there are any errors
    if (Object.values(errors).some(error => error !== null)) {
      showValidationErrors(Object.entries(errors)
        .filter(([_, error]) => error !== null)
        .map(([field, message]) => ({ field, message: message! }))
      );
      return;
    }

    // Proceed with API call
    try {
      await api.submitForm(formData);
      showToast('Form submitted successfully!', 'success');
    } catch (error) {
      showApiError(error, 'Failed to submit form');
    }
  };

  const handleApiCall = async () => {
    try {
      await api.fetchData();
      showToast('Data loaded successfully!', 'success');
    } catch (error) {
      showApiError(error, 'Failed to load data');
    }
  };

  return (
    <button onPress={handleApiCall}>
      Load Data
    </button>
  );
}
```

## Component Types

### InlineError
For form validation and contextual errors:

```tsx
import { InlineError } from '@/components/ui/errors';

<InlineError
  message="Email is required"
  type="validation"
  visible={hasError}
  compact={false}
  showIcon={true}
  dismissible={true}
  onDismiss={() => setHasError(false)}
/>
```

### ToastError
For temporary notifications:

```tsx
import { ToastError } from '@/components/ui/errors';

<ToastError
  message="Changes saved successfully"
  type="success"
  position="top"
  visible={true}
  actionText="Undo"
  onActionPress={handleUndo}
  autoHide={true}
  autoHideDuration={4000}
/>
```

### BannerError
For persistent system-wide messages:

```tsx
import { BannerError } from '@/components/ui/errors';

<BannerError
  message="Network connection is poor"
  type="warning"
  visible={true}
  fullWidth={true}
  actions={[
    {
      text: 'Retry',
      onPress: handleRetry,
      primary: true,
    }
  ]}
/>
```

### ModalError
For critical errors requiring attention:

```tsx
import { ModalError } from '@/components/ui/errors';

<ModalError
  title="Error"
  message="Failed to save changes"
  type="error"
  visible={true}
  buttons={[
    {
      text: 'Cancel',
      onPress: handleCancel,
      style: 'cancel',
    },
    {
      text: 'Try Again',
      onPress: handleRetry,
      style: 'default',
    },
  ]}
/>
```

## Advanced Validation with Race Condition Prevention

### Form Validation with Automatic Field Focusing

```tsx
import { useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { ErrorUtils } from '@/utils/ErrorUtils';
import { useError } from '@/components/ui/errors';

function AdvancedLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  
  // Refs for automatic field focusing
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
  const { showToast } = useError();

  // Focus first field with error
  const focusFirstErrorField = () => {
    if (validationErrors.email) emailInputRef.current?.focus();
    else if (validationErrors.password) passwordInputRef.current?.focus();
  };

  // Debounced validation for real-time feedback
  const debouncedValidation = useRef(
    ErrorUtils.debounceValidation((field: string, value: string) => {
      const error = ErrorUtils.validateSingleField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }, 300)
  ).current;

  const handleLogin = async () => {
    // Synchronous validation - prevents race conditions
    const localErrors = ErrorUtils.validateLoginForm(email, password);
    
    // Single setState call with all errors
    if (Object.values(localErrors).some(error => error !== null)) {
      setValidationErrors(localErrors);
      focusFirstErrorField();
      return;
    }

    try {
      await authService.login(email, password);
      showToast('Login successful!', 'success');
    } catch (error) {
      // Map server errors to form fields
      const serverErrors = mapServerErrorsToFields(error);
      setValidationErrors(serverErrors);
      focusFirstErrorField();
    }
  };

  return (
    <View>
      <TextInput
        ref={emailInputRef}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          // Clear error immediately when typing
          if (validationErrors.email) {
            setValidationErrors(prev => ({ ...prev, email: null }));
          }
          // Debounced validation for real-time feedback
          debouncedValidation('email', text);
        }}
        onBlur={() => {
          // Immediate validation on blur
          const error = ErrorUtils.validateSingleField('email', email);
          setValidationErrors(prev => ({ ...prev, email: error }));
        }}
      />
      <InlineError
        message={validationErrors.email || ''}
        type="validation"
        visible={!!validationErrors.email}
      />
      
      <TextInput
        ref={passwordInputRef}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (validationErrors.password) {
            setValidationErrors(prev => ({ ...prev, password: null }));
          }
          debouncedValidation('password', text);
        }}
        onBlur={() => {
          const error = ErrorUtils.validateSingleField('password', password);
          setValidationErrors(prev => ({ ...prev, password: error }));
        }}
        secureTextEntry
      />
      <InlineError
        message={validationErrors.password || ''}
        type="validation"
        visible={!!validationErrors.password}
      />
    </View>
  );
}
```

### Server Error Mapping

```tsx
const mapServerErrorsToFields = (error: any) => {
  const response = error.response?.data || error;
  
  return {
    email: response.errors?.email || 
           (response.message?.includes('email') ? response.message : null),
    password: response.errors?.password || 
              (response.message?.includes('password') ? response.message : null),
    username: response.errors?.username || 
              (response.message?.includes('username') ? response.message : null),
    general: response.errors?.general || 
             (!response.errors ? response.message : null)
  };
};
```

### Basic Error Handling

```tsx
import { useError } from '@/components/ui/errors';

function LoginForm() {
  const { showToast, showValidationErrors } = useError();

  const handleLogin = async (email: string, password: string) => {
    // Validation
    const errors = [];
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });

    if (errors.length > 0) {
      showValidationErrors(errors);
      return;
    }

    // API call
    try {
      await authService.login(email, password);
      showToast('Login successful!', 'success');
    } catch (error) {
      showToast('Invalid credentials', 'error');
    }
  };
}
```

### Network Error Handling

```tsx
import { useErrorHandling } from '@/components/ui/errors';

function DataComponent() {
  const { showNetworkError, showApiError } = useErrorHandling();

  const fetchData = async () => {
    try {
      const response = await api.getData();
      setData(response.data);
    } catch (error) {
      if (error.code === 'NETWORK_ERROR') {
        showNetworkError(fetchData); // Shows retry button
      } else {
        showApiError(error);
      }
    }
  };
}
```

## Enhanced Validation Utilities

### Synchronous Form Validation

```tsx
import { ErrorUtils } from '@/utils/ErrorUtils';

// Login form validation (prevents race conditions)
const validateLogin = (email: string, password: string) => {
  const errors = ErrorUtils.validateLoginForm(email, password);
  // Returns: { email: string | null, password: string | null }
  return errors;
};

// Registration form validation
const validateRegistration = (data: RegistrationData) => {
  const errors = ErrorUtils.validateRegistrationForm(
    data.firstName,
    data.lastName, 
    data.email,
    data.username,
    data.password,
    data.confirmPassword
  );
  // Returns complete error object for all fields
  return errors;
};

// Single field validation for real-time feedback
const validateField = (fieldName: string, value: string, additionalValue?: string) => {
  const error = ErrorUtils.validateSingleField(fieldName, value, additionalValue);
  // Returns: string | null
  return error;
};
```

### Debounced Validation for Performance

```tsx
import { useRef } from 'react';
import { ErrorUtils } from '@/utils/ErrorUtils';

function FormValidation() {
  // Create debounced validation function
  const debouncedValidate = useRef(
    ErrorUtils.debounceValidation((field: string, value: string) => {
      const error = ErrorUtils.validateSingleField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }, 300) // 300ms delay
  ).current;

  // Use in onChangeText for real-time validation
  const handleTextChange = (field: string, value: string) => {
    setValue(value);
    debouncedValidate(field, value);
  };
}
```

### Validation Rules

Available validation methods in ErrorUtils:

- `validateEmail(email: string)` - Email format validation
- `validatePassword(password: string, minLength?: number)` - Password strength
- `validateRequired(value: string, fieldName: string)` - Required field check
- `validatePasswordMatch(password: string, confirmPassword: string)` - Password confirmation
- `validateLoginForm(email: string, password: string)` - Complete login validation
- `validateRegistrationForm(...)` - Complete registration validation
- `validateSingleField(field: string, value: string, additionalValue?: string)` - Individual field validation
```

## Accessibility Features

- **Screen Reader Support**: All components include proper accessibility labels and roles
- **Haptic Feedback**: Platform-specific vibration patterns for different error severities:
  - Error: Strong impact notification
  - Warning: Warning notification  
  - Success: Success notification
  - Info/Validation: Light impact feedback
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Color Contrast**: High contrast colors that meet WCAG guidelines
- **Focus Management**: Automatic focus handling for modals and form errors
- **Field Focusing**: Automatic navigation to first field with validation error
- **Announcements**: Screen reader announcements for error state changes

## Performance Optimizations

### Race Condition Prevention

The error system includes several mechanisms to prevent validation race conditions:

```tsx
// ❌ Old approach - prone to race conditions
const validateForm = async () => {
  const emailError = await validateEmail(email); // Async
  const passwordError = await validatePassword(password); // Async
  
  if (emailError) setErrors(prev => ({ ...prev, email: emailError })); // Race condition
  if (passwordError) setErrors(prev => ({ ...prev, password: passwordError })); // Race condition
};

// ✅ New approach - race condition free
const validateForm = () => {
  const errors = ErrorUtils.validateLoginForm(email, password); // Synchronous
  setErrors(errors); // Single setState call
  
  // Focus first error field
  if (Object.values(errors).some(error => error !== null)) {
    focusFirstErrorField();
  }
};
```

### Debounced Validation

Prevents excessive validation calls during user input:

```tsx
// Debounced validation reduces validation calls by ~90%
const debouncedValidation = ErrorUtils.debounceValidation(
  (field: string, value: string) => {
    const error = ErrorUtils.validateSingleField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  }, 
  300 // Only validate after 300ms of no typing
);
```

### Memory Management

- Automatic cleanup of animation timers
- Proper cleanup of debounced functions
- Ref cleanup in useEffect cleanup functions

### Theme Colors

The error system automatically adapts to light/dark themes using the ERROR_COLORS configuration in `@/constants/ErrorConstants`.

### Custom Icons

You can override default icons by modifying the ERROR_ICONS mapping:

```tsx
import { ERROR_ICONS } from '@/constants/ErrorConstants';

// Customize icons
ERROR_ICONS.error = 'bug-outline';
ERROR_ICONS.warning = 'alert-triangle';
```

### Animation Timing

Adjust animation timings in the ANIMATION_PRESETS configuration:

```tsx
import { ANIMATION_PRESETS } from '@/constants/ErrorConstants';

// Customize animations
ANIMATION_PRESETS.slideDown.in.duration = 400;
```

## Error Boundary

Wrap components with ErrorBoundary to catch JavaScript errors:

```tsx
import { ErrorBoundary } from '@/components/ui/errors';

<ErrorBoundary
  fallback={(error) => (
    <Text>Something went wrong: {error.message}</Text>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

## Best Practices

1. **Use appropriate error types**: 
   - `error` for failures and critical issues
   - `warning` for potential issues that need attention
   - `validation` for form errors and input validation
   - `info` for informational notifications
   - `success` for confirmations and successful operations

2. **Choose the right component**:
   - InlineError for form validation and contextual errors
   - ToastError for temporary notifications and confirmations
   - BannerError for system-wide messages and persistent alerts
   - ModalError for critical alerts requiring immediate attention

3. **Prevent race conditions in validation**:
   - Use synchronous validation methods (`ErrorUtils.validateLoginForm`, `ErrorUtils.validateRegistrationForm`)
   - Make single `setState` calls with complete error objects
   - Avoid multiple async validation calls that can overwrite each other

4. **Implement proper field focusing**:
   - Use refs for all form inputs
   - Implement `focusFirstErrorField()` functions
   - Focus the first field with an error after validation

5. **Optimize validation performance**:
   - Use debounced validation for real-time feedback (`ErrorUtils.debounceValidation`)
   - Clear errors immediately when user starts typing
   - Validate individual fields on blur for immediate feedback

6. **Handle server errors intelligently**:
   - Map API errors to specific form fields when possible
   - Show general errors when field-specific mapping isn't available
   - Provide actionable error messages with clear resolution steps

7. **Provide actionable messages**: Include clear instructions on how to resolve the error

8. **Test accessibility**: Ensure all errors work with screen readers and support haptic feedback

9. **Handle network errors gracefully**: Provide retry options for network failures

10. **Use proper error severity levels**:
    - `critical` for system failures and security issues
    - `high` for blocking errors that prevent user actions
    - `medium` for validation errors and warnings
    - `low` for informational messages

## Performance Considerations

- **Memory Management**: All components properly clean up timers and animations
- **Debouncing**: Reduces validation calls by up to 90% during typing
- **Synchronous Validation**: Eliminates race conditions and improves reliability
- **Lazy Loading**: Components are only rendered when visible
- **Animation Optimization**: Uses native driver when possible for better performance

## Advanced Examples

### Complete Login Form with Race Condition Prevention

```tsx
import React, { useRef, useState } from 'react';
import { TextInput, TouchableOpacity, Text } from 'react-native';
import { ErrorUtils } from '@/utils/ErrorUtils';
import { useError } from '@/components/ui/errors';
import { InlineError } from '@/components/ui/errors';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  // Refs for field focusing
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const { showToast } = useError();

  // Focus first field with error
  const focusFirstErrorField = () => {
    if (validationErrors.email) emailInputRef.current?.focus();
    else if (validationErrors.password) passwordInputRef.current?.focus();
  };

  // Debounced validation for real-time feedback
  const debouncedValidation = useRef(
    ErrorUtils.debounceValidation((field: string, value: string) => {
      const error = ErrorUtils.validateSingleField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }, 300)
  ).current;

  const handleLogin = async () => {
    setLoading(true);

    // Synchronous validation - prevents race conditions
    const localErrors = ErrorUtils.validateLoginForm(email, password);
    
    if (Object.values(localErrors).some(error => error !== null)) {
      setValidationErrors(localErrors);
      focusFirstErrorField();
      setLoading(false);
      return;
    }

    try {
      await authService.login(email, password);
      showToast('Login successful!', 'success');
    } catch (error: any) {
      // Map server errors to form fields
      const serverErrors = {
        email: error.response?.data?.errors?.email || 
               (error.message?.includes('email') ? error.message : null),
        password: error.response?.data?.errors?.password || 
                 (error.message?.includes('password') ? error.message : null),
        general: !error.response?.data?.errors ? error.message : null
      };

      if (serverErrors.general) {
        showToast(serverErrors.general, 'error');
      } else {
        setValidationErrors(prev => ({ ...prev, ...serverErrors }));
        focusFirstErrorField();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        ref={emailInputRef}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          // Clear error immediately when typing
          if (validationErrors.email) {
            setValidationErrors(prev => ({ ...prev, email: null }));
          }
          // Debounced validation for real-time feedback
          debouncedValidation('email', text);
        }}
        onBlur={() => {
          // Immediate validation on blur
          const error = ErrorUtils.validateSingleField('email', email);
          setValidationErrors(prev => ({ ...prev, email: error }));
        }}
        placeholder="Email"
        keyboardType="email-address"
      />
      <InlineError
        message={validationErrors.email || ''}
        type="validation"
        visible={!!validationErrors.email}
        compact={true}
        showIcon={true}
      />

      <TextInput
        ref={passwordInputRef}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (validationErrors.password) {
            setValidationErrors(prev => ({ ...prev, password: null }));
          }
          debouncedValidation('password', text);
        }}
        onBlur={() => {
          const error = ErrorUtils.validateSingleField('password', password);
          setValidationErrors(prev => ({ ...prev, password: error }));
        }}
        placeholder="Password"
        secureTextEntry
      />
      <InlineError
        message={validationErrors.password || ''}
        type="validation"
        visible={!!validationErrors.password}
        compact={true}
        showIcon={true}
      />

      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        <Text>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Error System Migration Guide

If you're upgrading from a previous error handling system:

```tsx
// ❌ Old approach with race conditions
const validateForm = async () => {
  setErrors({}); // Clear all errors
  
  // Multiple async validations - race condition prone
  if (!email) setErrors(prev => ({ ...prev, email: 'Required' }));
  if (!password) setErrors(prev => ({ ...prev, password: 'Required' }));
  
  // Problems: 
  // - Multiple setState calls
  // - Race conditions between validations
  // - No field focusing
  // - Inconsistent error clearing
};

// ✅ New approach - race condition free
const validateForm = () => {
  // Single synchronous validation
  const errors = ErrorUtils.validateLoginForm(email, password);
  
  // Single setState call
  setValidationErrors(errors);
  
  // Automatic field focusing
  if (Object.values(errors).some(error => error !== null)) {
    focusFirstErrorField();
    return false;
  }
  
  return true;
};
```

## API Reference

See the TypeScript interfaces in `@/types/error.types.ts` for complete API documentation.

### ErrorUtils Methods

- `validateLoginForm(email: string, password: string)` - Complete login validation
- `validateRegistrationForm(firstName, lastName, email, username, password, confirmPassword)` - Complete registration validation  
- `validateSingleField(field: string, value: string, additionalValue?: string)` - Single field validation
- `validateEmail(email: string)` - Email format validation
- `validatePassword(password: string, minLength?: number)` - Password strength validation
- `validateRequired(value: string, fieldName: string)` - Required field validation
- `validatePasswordMatch(password: string, confirmPassword: string)` - Password confirmation
- `debounceValidation(func: Function, delay: number)` - Create debounced validation function
- `triggerHapticFeedback(type: ErrorType)` - Trigger platform haptic feedback
- `sanitizeMessage(message: string, maxLength?: number)` - Sanitize error messages
- `generateErrorId()` - Generate unique error IDs for tracking
