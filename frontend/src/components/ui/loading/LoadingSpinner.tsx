import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { LoadingSpinnerProps } from '../../../types/loading.types';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color = '#3B82F6', // primary-600
  className = '',
}) => {
  return (
    <View style={{
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <ActivityIndicator
        size={size}
        color={color}
      />
    </View>
  );
};
