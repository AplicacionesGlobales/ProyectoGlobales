// components/ui/ThemedButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { useTheme } from '../../contexts/ThemeContext';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  disabled,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'large':
        baseStyle.paddingVertical = 20;
        baseStyle.paddingHorizontal = 24;
        break;
      default: // medium
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 20;
    }

    // Variant colors
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = disabled ? colors.textSecondary : colors.primary;
        baseStyle.shadowColor = colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = disabled ? colors.textSecondary : colors.secondary;
        baseStyle.shadowColor = colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = disabled ? colors.textSecondary : colors.primary;
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 20;
        break;
      default: // medium
        baseStyle.fontSize = 18;
    }

    // Variant text colors
    switch (variant) {
      case 'primary':
      case 'secondary':
        baseStyle.color = '#ffffff';
        break;
      case 'outline':
        baseStyle.color = disabled ? colors.textSecondary : colors.primary;
        break;
      case 'ghost':
        baseStyle.color = disabled ? colors.textSecondary : colors.primary;
        break;
    }

    return baseStyle;
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#ffffff';
      case 'outline':
      case 'ghost':
        return disabled ? colors.textSecondary : colors.primary;
      default:
        return '#ffffff';
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const renderIcon = () => {
    if (loading) {
      return <ActivityIndicator color={getIconColor()} size="small" />;
    }
    
    if (icon) {
      return (
        <Ionicons 
          name={icon as any} 
          size={getIconSize()} 
          color={getIconColor()}
          style={{ 
            marginRight: iconPosition === 'left' ? 8 : 0,
            marginLeft: iconPosition === 'right' ? 8 : 0
          }} 
        />
      );
    }
    
    return null;
  };

  return (
    <StyledTouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      
      {!loading && (
        <StyledText style={getTextStyle()}>
          {title}
        </StyledText>
      )}
      
      {iconPosition === 'right' && renderIcon()}
    </StyledTouchableOpacity>
  );
};

export default ThemedButton;