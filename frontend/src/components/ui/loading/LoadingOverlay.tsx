import React from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingOverlayProps } from '../../../types/loading.types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
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
      <View 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor,
        }}
      >
        <View 
          style={{
            backgroundColor: overlayColor,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: screenWidth * 0.6,
            maxWidth: screenWidth * 0.8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <LoadingSpinner 
            size="large" 
            color={spinnerColor}
          />
          
          {message && (
            <Text 
              style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '500',
                color: textColor,
                marginTop: 16,
              }}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};
