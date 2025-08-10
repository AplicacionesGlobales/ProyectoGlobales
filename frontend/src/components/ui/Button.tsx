import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
  View,
} from 'react-native';
import { styled } from 'nativewind';

const { width: screenWidth } = Dimensions.get('window');

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  buttonClassName?: string;
  textClassName?: string;
  animated?: boolean;
  ripple?: boolean;
  shadow?: boolean;
}

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);
const StyledView = styled(View);
const StyledActivityIndicator = styled(ActivityIndicator);

export const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  rounded = 'md',
  fullWidth = false,
  disabled = false,
  leftIcon,
  rightIcon,
  buttonClassName = '',
  textClassName = '',
  animated = true,
  ripple = true,
  shadow = true,
  onPress,
  onPressIn,
  onPressOut,
  ...touchableProps
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  // Responsive sizing
  const getResponsiveSize = () => {
    if (screenWidth < 380) {
      // Small phones: bump up sizes
      if (size === 'xs') return 'sm';
      if (size === 'sm') return 'md';
      return size;
    }
    if (screenWidth >= 768) {
      // Tablets: can use larger sizes
      if (size === 'xs') return 'sm';
      return size;
    }
    return size;
  };

  const responsiveSize = getResponsiveSize();

  // Size configurations
  const sizeConfig = {
    xs: {
      button: 'px-2.5 py-1.5 min-h-[32px]',
      text: 'text-xs',
      icon: 'w-3 h-3',
    },
    sm: {
      button: 'px-3 py-2 min-h-[36px]',
      text: 'text-sm',
      icon: 'w-4 h-4',
    },
    md: {
      button: 'px-4 py-2.5 min-h-[44px]',
      text: 'text-base',
      icon: 'w-5 h-5',
    },
    lg: {
      button: 'px-5 py-3 min-h-[52px]',
      text: 'text-lg',
      icon: 'w-6 h-6',
    },
    xl: {
      button: 'px-6 py-3.5 min-h-[60px]',
      text: 'text-xl',
      icon: 'w-7 h-7',
    },
  };

  // Color configurations
  const colorConfig = {
    primary: {
      solid: 'bg-primary-600 active:bg-primary-700',
      outline: 'border-2 border-primary-600',
      ghost: 'bg-transparent',
      link: 'bg-transparent',
      text: {
        solid: 'text-white',
        outline: 'text-primary-600',
        ghost: 'text-primary-600',
        link: 'text-primary-600',
      },
    },
    secondary: {
      solid: 'bg-gray-600 active:bg-gray-700',
      outline: 'border-2 border-gray-600',
      ghost: 'bg-transparent',
      link: 'bg-transparent',
      text: {
        solid: 'text-white',
        outline: 'text-gray-600',
        ghost: 'text-gray-600',
        link: 'text-gray-600',
      },
    },
    success: {
      solid: 'bg-success active:bg-green-700',
      outline: 'border-2 border-success',
      ghost: 'bg-transparent',
      link: 'bg-transparent',
      text: {
        solid: 'text-white',
        outline: 'text-success',
        ghost: 'text-success',
        link: 'text-success',
      },
    },
    warning: {
      solid: 'bg-warning active:bg-amber-600',
      outline: 'border-2 border-warning',
      ghost: 'bg-transparent',
      link: 'bg-transparent',
      text: {
        solid: 'text-white',
        outline: 'text-warning',
        ghost: 'text-warning',
        link: 'text-warning',
      },
    },
    error: {
      solid: 'bg-error active:bg-red-600',
      outline: 'border-2 border-error',
      ghost: 'bg-transparent',
      link: 'bg-transparent',
      text: {
        solid: 'text-white',
        outline: 'text-error',
        ghost: 'text-error',
        link: 'text-error',
      },
    },
    info: {
      solid: 'bg-info active:bg-blue-600',
      outline: 'border-2 border-info',
      ghost: 'bg-transparent',
      link: 'bg-transparent',
      text: {
        solid: 'text-white',
        outline: 'text-info',
        ghost: 'text-info',
        link: 'text-info',
      },
    },
  };

  // Rounded configurations
  const roundedConfig = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const handlePressIn = (e: any) => {
    setIsPressed(true);
    if (animated) {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    setIsPressed(false);
    if (animated) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
    onPressOut?.(e);
  };

  const config = sizeConfig[responsiveSize];
  const colorScheme = colorConfig[color];

  const AnimatedTouchable = animated ? Animated.createAnimatedComponent(TouchableOpacity) : TouchableOpacity;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animated && { transform: [{ scale: scaleValue }] },
      ]}
      activeOpacity={0.8}
      {...touchableProps}
    >
      <StyledView
        className={`
          flex-row items-center justify-center
          ${config.button}
          ${colorScheme[variant]}
          ${roundedConfig[rounded]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'opacity-50' : ''}
          ${shadow && variant === 'solid' && !disabled ? 
            Platform.OS === 'ios' ? 'shadow-sm' : 'elevation-2' 
            : ''
          }
          ${isPressed && ripple ? 'opacity-80' : ''}
          ${buttonClassName}
        `}
      >
        {loading ? (
          <StyledActivityIndicator
            color={variant === 'solid' ? '#ffffff' : colorScheme.text[variant]}
            size={responsiveSize === 'xs' || responsiveSize === 'sm' ? 'small' : 'small'}
          />
        ) : (
          <>
            {leftIcon && (
              <StyledView className={`mr-2 ${config.icon}`}>
                {leftIcon}
              </StyledView>
            )}
            
            <StyledText
              className={`
                font-semibold
                ${config.text}
                ${colorScheme.text[variant]}
                ${variant === 'link' ? 'underline' : ''}
                ${textClassName}
                ${Platform.OS === 'ios' ? 'font-system' : 'font-sans'}
              `}
              numberOfLines={1}
            >
              {title}
            </StyledText>
            
            {rightIcon && (
              <StyledView className={`ml-2 ${config.icon}`}>
                {rightIcon}
              </StyledView>
            )}
          </>
        )}
      </StyledView>
    </AnimatedTouchable>
  );
};