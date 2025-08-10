import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Dimensions,
  Platform,
} from 'react-native';
import { styled } from 'nativewind';

const { width: screenWidth } = Dimensions.get('window');

interface IconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  rounded?: boolean;
  className?: string;
}

const StyledTouchableOpacity = styled(TouchableOpacity);

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  color = 'primary',
  rounded = true,
  disabled = false,
  className = '',
  ...props
}) => {
  // Responsive sizing
  const getResponsiveSize = () => {
    if (screenWidth < 380) {
      return size === 'sm' ? 'md' : size;
    }
    return size;
  };

  const responsiveSize = getResponsiveSize();

  const sizeConfig = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const colorConfig = {
    primary: {
      solid: 'bg-primary-600 active:bg-primary-700',
      outline: 'border-2 border-primary-600',
      ghost: 'bg-transparent active:bg-primary-100',
    },
    secondary: {
      solid: 'bg-gray-600 active:bg-gray-700',
      outline: 'border-2 border-gray-600',
      ghost: 'bg-transparent active:bg-gray-100',
    },
    success: {
      solid: 'bg-success active:bg-green-700',
      outline: 'border-2 border-success',
      ghost: 'bg-transparent active:bg-green-100',
    },
    warning: {
      solid: 'bg-warning active:bg-amber-600',
      outline: 'border-2 border-warning',
      ghost: 'bg-transparent active:bg-amber-100',
    },
    error: {
      solid: 'bg-error active:bg-red-600',
      outline: 'border-2 border-error',
      ghost: 'bg-transparent active:bg-red-100',
    },
    info: {
      solid: 'bg-info active:bg-blue-600',
      outline: 'border-2 border-info',
      ghost: 'bg-transparent active:bg-blue-100',
    },
  };

  return (
    <StyledTouchableOpacity
      className={`
        flex items-center justify-center
        ${sizeConfig[responsiveSize]}
        ${colorConfig[color][variant]}
        ${rounded ? 'rounded-full' : 'rounded-md'}
        ${disabled ? 'opacity-50' : ''}
        ${Platform.OS === 'ios' ? 'shadow-sm' : ''}
        ${className}
      `}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {icon}
    </StyledTouchableOpacity>
  );
};
