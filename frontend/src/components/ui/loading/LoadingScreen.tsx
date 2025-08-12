import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingScreenProps } from '../../../types/loading.types';

const { height: screenHeight } = Dimensions.get('window');

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  backgroundColor = '#FFFFFF',
  spinnerColor = '#3B82F6',
  textColor = '#374151',
  className = '',
}) => {
  return (
    <View 
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor,
        paddingHorizontal: 32,
        minHeight: screenHeight * 0.6,
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
  );
};
