// components/ui/ThemedInput.tsx
import React, { forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Animated, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { useTheme } from '../../contexts/ThemeContext';
import { InlineError } from '../ui/errors';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ThemedInputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  icon?: string;
  field: string;
  hasError?: string | null;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  showToggle?: boolean;
  isToggleVisible?: boolean;
  onToggle?: () => void;
}

const ThemedInput = forwardRef<TextInput, ThemedInputProps>(({
  label,
  required,
  icon,
  field,
  hasError,
  isFocused,
  onFocus,
  onBlur,
  showToggle,
  isToggleVisible,
  onToggle,
  value,
  ...textInputProps
}, ref) => {
  const { colors } = useTheme();
  const isValid = value && !hasError && !isFocused;

  const getBorderColor = () => {
    if (hasError) return colors.error;
    if (isFocused) return colors.primary;
    if (isValid) return colors.success;
    return '#e5e7eb';
  };

  const getIconColor = () => {
    if (hasError) return colors.error;
    if (isFocused) return colors.primary;
    return '#9ca3af';
  };

  return (
    <Animated.View style={{
      marginBottom: 16,
      transform: [{
        scale: isFocused ? 1.02 : 1
      }]
    }}>
      {/* Label */}
      {label && (
        <StyledText style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 6,
          marginLeft: 2,
        }}>
          {label}
          {required && <StyledText style={{ color: colors.error }}> *</StyledText>}
        </StyledText>
      )}

      {/* Input Container */}
      <StyledView style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 14,
        borderColor: getBorderColor(),
        backgroundColor: isFocused ? colors.surface : '#ffffff',
        shadowColor: isFocused ? colors.primary : '#000',
        shadowOffset: { width: 0, height: isFocused ? 4 : 1 },
        shadowOpacity: isFocused ? 0.1 : 0.05,
        shadowRadius: isFocused ? 8 : 2,
        elevation: isFocused ? 4 : 1,
      }}>
        {/* Icon */}
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={getIconColor()}
            style={{ marginRight: 10 }}
          />
        )}

        {/* Text Input */}
        <StyledTextInput
          ref={ref}
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text,
            paddingVertical: Platform.OS === 'ios' ? 14 : 10,
          }}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onFocus={onFocus}
          onBlur={onBlur}
          {...textInputProps}
        />

        {/* Toggle Button (for password visibility) */}
        {showToggle && (
          <StyledTouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
            <Ionicons
              name={isToggleVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </StyledTouchableOpacity>
        )}

        {/* Valid Checkmark */}
        {isValid && (
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        )}
      </StyledView>

      {/* Error Message */}
      <InlineError
        message={hasError || ''}
        type="validation"
        visible={!!hasError}
        compact={true}
        showIcon={true}
        dismissible={false}
      />
    </Animated.View>
  );
});

ThemedInput.displayName = 'ThemedInput';

export default ThemedInput;