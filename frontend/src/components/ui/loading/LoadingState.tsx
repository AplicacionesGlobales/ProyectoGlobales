import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingStateProps } from '../../../types/loading.types';

const StyledView = styled(View);
const StyledText = styled(Text);

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  children,
  fallback,
  message = 'Cargando...',
  variant = 'spinner',
  size = 'small',
  color = '#3B82F6',
  className = '',
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const renderLoadingContent = () => {
    switch (variant) {
      case 'inline':
        return (
          <StyledView className={`flex-row items-center justify-center py-4 ${className}`}>
            <LoadingSpinner size={size} color={color} className="mr-2" />
            {message && (
              <StyledText className="text-sm text-gray-600 ml-2">
                {message}
              </StyledText>
            )}
          </StyledView>
        );
      
      case 'overlay':
        return (
          <StyledView className={`absolute inset-0 bg-white/80 justify-center items-center z-50 ${className}`}>
            <LoadingSpinner size={size} color={color} className="mb-2" />
            {message && (
              <StyledText className="text-sm text-gray-600 text-center">
                {message}
              </StyledText>
            )}
          </StyledView>
        );
      
      default: // spinner
        return (
          <StyledView className={`justify-center items-center py-8 ${className}`}>
            <LoadingSpinner size={size} color={color} className="mb-2" />
            {message && (
              <StyledText className="text-sm text-gray-600 text-center">
                {message}
              </StyledText>
            )}
          </StyledView>
        );
    }
  };

  return renderLoadingContent();
};
