import React from 'react';
import { View, Text } from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { LoadingStateProps } from '../../../types/loading.types';

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  children,
  fallback,
  message = 'Loading...',
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
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
          }}>
            <LoadingSpinner size={size} color={color} />
            {message && (
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                marginLeft: 8,
              }}>
                {message}
              </Text>
            )}
          </View>
        );
      
      case 'overlay':
        return (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50,
          }}>
            <LoadingSpinner size={size} color={color} />
            {message && (
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
                marginTop: 8,
              }}>
                {message}
              </Text>
            )}
          </View>
        );
      
      default: // spinner
        return (
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 32,
          }}>
            <LoadingSpinner size={size} color={color} />
            {message && (
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
                marginTop: 8,
              }}>
                {message}
              </Text>
            )}
          </View>
        );
    }
  };

  return renderLoadingContent();
};
