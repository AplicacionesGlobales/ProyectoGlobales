import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingScreenProps } from '../../../types/loading.types';

const { height: screenHeight } = Dimensions.get('window');

const StyledView = styled(View);
const StyledText = styled(Text);

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando...',
  backgroundColor = '#FFFFFF',
  spinnerColor = '#3B82F6',
  textColor = '#374151',
  className = '',
}) => {
  return (
    <StyledView 
      className={`
        flex-1 
        justify-center 
        items-center 
        px-8
        ${className}
      `}
      style={{ 
        backgroundColor,
        minHeight: screenHeight * 0.6 
      }}
    >
      <LoadingSpinner 
        size="large" 
        color={spinnerColor}
        className="mb-4"
      />
      
      {message && (
        <StyledText 
          className="text-center text-base font-medium"
          style={{ color: textColor }}
        >
          {message}
        </StyledText>
      )}
    </StyledView>
  );
};
