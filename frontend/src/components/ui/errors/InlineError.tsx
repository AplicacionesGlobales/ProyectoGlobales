import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InlineErrorProps } from '@/types/error.types';
import { ERROR_ICONS, ERROR_COLORS } from '@/constants/ErrorConstants';
import { useThemeColor } from '@/hooks/useThemeColor';

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  type = 'error',
  severity = 'medium',
  visible = true,
  compact = false,
  showIcon = true,
  dismissible = false,
  onDismiss,
  onPress,
  testID,
}) => {
  const isDark = false; 
  const colors = ERROR_COLORS[isDark ? 'dark' : 'light'][type];
  
  if (!visible || !message) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const iconName = ERROR_ICONS[type];
  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    compact && styles.compact,
  ];

  const textStyle = [
    styles.text,
    { color: colors.text },
    compact && styles.compactText,
  ];

  const content = (
    <View style={containerStyle} testID={testID}>
      <View style={styles.content}>
        {showIcon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={iconName as any}
              size={compact ? 16 : 20}
              color={colors.icon}
              style={styles.icon}
            />
          </View>
        )}
        <Text style={textStyle} numberOfLines={compact ? 1 : 3}>
          {message}
        </Text>
        {dismissible && (
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss error"
          >
            <Ionicons
              name="close"
              size={compact ? 14 : 16}
              color={colors.icon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (onPress && !dismissible) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 32,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // Icon styles
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  compactText: {
    fontSize: 12,
    lineHeight: 16,
  },
  dismissButton: {
    marginLeft: 8,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
