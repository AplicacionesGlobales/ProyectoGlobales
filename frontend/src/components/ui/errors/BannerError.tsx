import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BannerErrorProps } from '@/types/error.types';
import { ERROR_ICONS, ERROR_COLORS } from '@/constants/ErrorConstants';

export const BannerError: React.FC<BannerErrorProps> = ({
  message,
  type = 'error',
  severity = 'medium',
  visible = true,
  dismissible = true,
  fullWidth = true,
  sticky = false,
  actions,
  onDismiss,
  autoHide = false,
  autoHideDuration = 6000,
  testID,
}) => {
  const isDark = false; 
  const colors = ERROR_COLORS[isDark ? 'dark' : 'light'][type];
  
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      showBanner();
      if (autoHide && !sticky) {
        const timer = setTimeout(() => {
          hideBanner();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else {
      hideBanner();
    }
  }, [visible, autoHide, sticky, autoHideDuration]);

  const showBanner = () => {
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
  };

  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
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
  };

  const handleDismiss = () => {
    hideBanner();
  };

  if (!visible) {
    return null;
  }

  const iconName = ERROR_ICONS[type];
  
  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
      transform: [{ translateY: slideAnim }],
      opacity: opacityAnim,
    },
    fullWidth && styles.fullWidth,
    sticky && styles.sticky,
  ];

  return (
    <Animated.View style={containerStyle} testID={testID}>
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={iconName as any}
              size={24}
              color={colors.icon}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
              {message}
            </Text>
          </View>

          {dismissible && (
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.dismissButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Dismiss banner"
            >
              <Ionicons
                name="close"
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          )}
        </View>

        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                style={[
                  styles.actionButton,
                  { 
                    borderColor: colors.border,
                    backgroundColor: action.primary ? colors.icon : 'transparent',
                  }
                ]}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text 
                  style={[
                    styles.actionText, 
                    { 
                      color: action.primary ? '#ffffff' : colors.icon 
                    }
                  ]}
                >
                  {action.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 30 : 10,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },
  fullWidth: {
    left: 0,
    right: 0,
  },
  sticky: {
    position: 'relative',
    top: 0,
  },
  content: {
    minHeight: 20,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 20,
  },
  iconContainer: {
    marginRight: 12,
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
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingLeft: 36, 
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
