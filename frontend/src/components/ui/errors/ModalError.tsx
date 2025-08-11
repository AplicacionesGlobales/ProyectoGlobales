import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalErrorProps } from '@/types/error.types';
import { ERROR_ICONS, ERROR_COLORS } from '@/constants/ErrorConstants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ModalError: React.FC<ModalErrorProps> = ({
  title,
  message,
  description,
  type = 'error',
  severity = 'medium',
  visible = true,
  dismissible = true,
  buttons,
  icon,
  onDismiss,
  testID,
}) => {
  const isDark = false; // Get from theme context
  const colors = ERROR_COLORS[isDark ? 'dark' : 'light'][type];
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      showModal();
    } else {
      hideModal();
    }
  }, [visible]);

  const showModal = () => {
    Animated.parallel([
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
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

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
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

  const handleBackdropPress = () => {
    if (dismissible) {
      hideModal();
    }
  };

  const handleDismiss = () => {
    hideModal();
  };

  const iconName = ERROR_ICONS[type];
  const defaultButtons = [
    {
      text: 'OK',
      onPress: handleDismiss,
      style: 'default' as const,
    },
  ];

  const modalButtons = buttons || defaultButtons;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      testID={testID}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.background,
            { opacity: backgroundOpacityAnim }
          ]}
        >
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={styles.backgroundTouchable} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          <View 
            style={[
              styles.modal,
              { backgroundColor: isDark ? '#2d2d2d' : '#ffffff' }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                {icon || (
                  <View 
                    style={[
                      styles.iconBackground,
                      { backgroundColor: colors.background }
                    ]}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={28}
                      color={colors.icon}
                    />
                  </View>
                )}
              </View>

              {dismissible && (
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.closeButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Close modal"
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? '#ffffff' : '#666666'}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {title && (
                <Text 
                  style={[
                    styles.title,
                    { color: isDark ? '#ffffff' : '#1a1a1a' }
                  ]}
                >
                  {title}
                </Text>
              )}

              <Text 
                style={[
                  styles.message,
                  { color: isDark ? '#e6e6e6' : '#333333' }
                ]}
              >
                {message}
              </Text>

              {description && (
                <Text 
                  style={[
                    styles.description,
                    { color: isDark ? '#cccccc' : '#666666' }
                  ]}
                >
                  {description}
                </Text>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {modalButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={button.onPress}
                  style={[
                    styles.button,
                    button.style === 'destructive' && styles.destructiveButton,
                    button.style === 'cancel' && styles.cancelButton,
                    index === modalButtons.length - 1 && styles.lastButton,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.buttonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'default' && { color: colors.icon },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  backgroundTouchable: {
    flex: 1,
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
  },
  modal: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    alignItems: 'center',
  },
  lastButton: {
    borderBottomWidth: 0,
  },
  destructiveButton: {
    backgroundColor: '#ff3b30',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: '#ffffff',
  },
  cancelButtonText: {
    color: '#666666',
  },
});
