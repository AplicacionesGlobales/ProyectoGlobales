import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  Animated,
} from 'react-native';
import { styled } from 'nativewind';
import { ResponsiveUtils } from '../../utils/responsive';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: 'outline' | 'filled' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  animated?: boolean;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export class InputConfig {
  static getSizeConfig(size: 'sm' | 'md' | 'lg') {
    const configs = {
      sm: {
        input: 'text-sm py-2 px-3',
        label: 'text-xs mb-1',
        helper: 'text-xs mt-1',
        minHeight: 'min-h-[40px]',
      },
      md: {
        input: 'text-base py-3 px-4',
        label: 'text-sm mb-1.5',
        helper: 'text-sm mt-1.5',
        minHeight: 'min-h-[48px]',
      },
      lg: {
        input: 'text-lg py-4 px-5',
        label: 'text-base mb-2',
        helper: 'text-base mt-2',
        minHeight: 'min-h-[56px]',
      },
    };
    return configs[size];
  }

  static getVariantConfig(variant: 'outline' | 'filled' | 'underline', isFocused: boolean, hasError: boolean) {
    const configs = {
      outline: {
        container: `border ${hasError ? 'border-error' : isFocused ? 'border-primary-500 border-2' : 'border-gray-300'}`,
        background: 'bg-white dark:bg-gray-800',
      },
      filled: {
        container: `border-b-2 ${hasError ? 'border-error' : isFocused ? 'border-primary-500' : 'border-gray-300'}`,
        background: 'bg-gray-100 dark:bg-gray-700',
      },
      underline: {
        container: `border-b ${hasError ? 'border-error' : isFocused ? 'border-primary-500 border-b-2' : 'border-gray-300'}`,
        background: 'bg-transparent',
      },
    };
    return configs[variant];
  }

  static getRoundedConfig(rounded: 'none' | 'sm' | 'md' | 'lg' | 'full') {
    const configs = {
      none: 'rounded-none',
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };
    return configs[rounded];
  }

  static getPlatformStyles() {
    return {
      fontFamily: ResponsiveUtils.isIOS() ? 'font-system' : 'font-sans',
      shadow: ResponsiveUtils.isAndroid() ? 'elevation-1' : 'shadow-sm',
      textLineHeight: ResponsiveUtils.isIOS() ? 'leading-tight' : 'leading-normal',
    };
  }

  static getPlaceholderColor(hasError: boolean): string {
    return hasError ? '#ef4444' : '#9ca3af';
  }
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outline',
  size = 'md',
  rounded = 'md',
  disabled = false,
  required = false,
  containerClassName = '',
  inputClassName = '',
  labelClassName = '',
  animated = true,
  ...textInputProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Get responsive size
  const responsiveSize = ResponsiveUtils.getInputSize(size);
  
  // Get configurations
  const sizeConfig = InputConfig.getSizeConfig(responsiveSize);
  const variantConfig = InputConfig.getVariantConfig(variant, isFocused, !!error);
  const roundedStyle = InputConfig.getRoundedConfig(rounded);
  const platformStyles = InputConfig.getPlatformStyles();

  const handleFocus = () => {
    setIsFocused(true);
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    textInputProps.onFocus?.(null as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    textInputProps.onBlur?.(null as any);
  };

  return (
    <StyledView className={`mb-4 ${containerClassName}`}>
      {label && (
        <StyledText 
          className={`
            font-medium text-gray-700 dark:text-gray-200 
            ${sizeConfig.label} 
            ${labelClassName}
            ${platformStyles.fontFamily}
          `}
        >
          {label}
          {required && <StyledText className="text-error ml-1">*</StyledText>}
        </StyledText>
      )}
      
      <StyledView 
        className={`
          flex-row items-center
          ${variantConfig.container}
          ${variantConfig.background}
          ${roundedStyle}
          ${sizeConfig.minHeight}
          ${disabled ? 'opacity-50' : ''}
          ${platformStyles.shadow}
        `}
      >
        {leftIcon && (
          <StyledView className="ml-3">
            {leftIcon}
          </StyledView>
        )}
        
        <StyledTextInput
          ref={ref}
          className={`
            flex-1 
            ${sizeConfig.input} 
            text-gray-900 dark:text-white
            ${inputClassName}
            ${platformStyles.textLineHeight}
          `}
          placeholderTextColor={InputConfig.getPlaceholderColor(!!error)}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        
        {rightIcon && (
          <StyledTouchableOpacity
            onPress={onRightIconPress}
            disabled={disabled}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </StyledTouchableOpacity>
        )}
      </StyledView>
      
      {error && (
        <StyledText className={`text-error ${sizeConfig.helper} ml-1`}>
          {error}
        </StyledText>
      )}
      
      {!error && helperText && (
        <StyledText className={`text-gray-500 dark:text-gray-400 ${sizeConfig.helper} ml-1`}>
          {helperText}
        </StyledText>
      )}
    </StyledView>
  );
});

Input.displayName = 'Input';