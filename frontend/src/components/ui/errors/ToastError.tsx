import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToastErrorProps } from '@/types/error.types';
import { ERROR_ICONS, ERROR_COLORS } from '@/constants/ErrorConstants';

const { width: screenWidth } = Dimensions.get('window');

export const ToastError: React.FC<ToastErrorProps> = ({
  message,
  type = 'error',
  severity = 'medium',
  visible = true,
  position = 'top',
  animated = true,
  actionText,
  onActionPress,
  onDismiss,
  autoHide = true,
  autoHideDuration = 4000,
  testID,
}) => {
  const isDark = false; // Get from theme context
  const colors = ERROR_COLORS[isDark ? 'dark' : 'light'][type];
  
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      showToast();
      if (autoHide) {
        const timer = setTimeout(() => {
          hideToast();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible, autoHide, autoHideDuration]);

  const showToast = () => {
    if (animated) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const hideToast = () => {
    if (animated) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: position === 'top' ? -100 : 100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onDismiss) {
          onDismiss();
        }
      });
    } else if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible && !animated) {
    return null;
  }

  const iconName = ERROR_ICONS[type];
  
  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      borderColor: colors.border,
      transform: [
        { translateY: slideAnim },
      ],
      opacity: opacityAnim,
    },
    position === 'top' && { 
      top: Platform.OS === 'ios' ? 60 : 40,
    },
    position === 'bottom' && { 
      bottom: Platform.OS === 'ios' ? 60 : 40,
    },
    position === 'center' && styles.centerPosition,
  ];

  return (
    <Animated.View style={containerStyle} testID={testID}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={iconName as any}
            size={24}
            color={colors.icon}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={3}>
            {message}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          {actionText && onActionPress && (
            <TouchableOpacity
              onPress={onActionPress}
              style={[styles.actionButton, { borderColor: colors.border }]}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text style={[styles.actionText, { color: colors.icon }]}>
                {actionText}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={hideToast}
            style={styles.dismissButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss notification"
          >
            <Ionicons
              name="close"
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  centerPosition: {
    top: '50%',
    marginTop: -50,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
});
