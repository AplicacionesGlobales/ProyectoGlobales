import React from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingOverlayProps } from '../../../types/loading.types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StyledView = styled(View);
const StyledText = styled(Text);

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Cargando...',
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
  overlayColor = '#FFFFFF',
  spinnerColor = '#3B82F6',
  textColor = '#374151',
  transparent = true,
  className = '',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType="fade"
      statusBarTranslucent
    >
      <StyledView 
        className={`
          flex-1 
          justify-center 
          items-center
          ${className}
        `}
        style={{ backgroundColor }}
      >
        <StyledView 
          className="
            bg-white 
            rounded-xl 
            p-8 
            items-center 
            shadow-lg
            mx-8
          "
          style={{ 
            backgroundColor: overlayColor,
            minWidth: screenWidth * 0.6,
            maxWidth: screenWidth * 0.8,
          }}
        >
          <LoadingSpinner 
            size="large" 
            color={spinnerColor}
            className="mb-4"
          />
          
          {message && (
            <StyledText 
              className="
                text-center 
                text-base 
                font-medium
              "
              style={{ color: textColor }}
            >
              {message}
            </StyledText>
          )}
        </StyledView>
      </StyledView>
    </Modal>
  );
};
