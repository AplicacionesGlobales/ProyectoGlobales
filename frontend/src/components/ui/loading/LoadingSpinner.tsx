import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { styled } from 'nativewind';
import { LoadingSpinnerProps } from '../../../types/loading.types';

const StyledView = styled(View);
const StyledActivityIndicator = styled(ActivityIndicator);

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color = '#3B82F6', // primary-600
  className = '',
}) => {
  return (
    <StyledView className={`justify-center items-center ${className}`}>
      <StyledActivityIndicator
        size={size}
        color={color}
      />
    </StyledView>
  );
};
