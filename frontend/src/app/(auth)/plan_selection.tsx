import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { usePlanSelection } from '@/hooks/usePlanSelections';
import { PlanCard } from '@/components/ui/PlanCard';
import { AVAILABLE_PLANS } from '@/constants/Plans';

const { width: screenWidth } = Dimensions.get('window');

export default function PlanSelectionScreen() {
  const { colors } = useTheme();
  
  const {
    plans,
    selectedPlan,
    loading,
    error,
    selectPlan,
    confirmPlanSelection,
    getSelectedPlanDetails,
  } = usePlanSelection(
    1, // userId - obtener del contexto de auth
    (response) => {
      Alert.alert(
        '🎉 ¡Excelente elección!',
        `Has seleccionado el plan ${getSelectedPlanDetails()?.name}. Ahora configuremos tu negocio.`,
        [
          {
            text: 'Continuar',
            onPress: () => router.push('./business-setup')
          }
        ]
      );
    },
    (error) => {
      Alert.alert('Error', error.message);
    }
  );
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnims = useRef(plans.map(() => new Animated.Value(0.9))).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(100, 
        scaleAnims.map(anim => 
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();

    // Confetti animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSelectPlan = (planId: string) => {
    selectPlan(planId);
    
    // Animate the selected card
    const index = plans.findIndex(p => p.id === planId);
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: 1.05,
        speed: 20,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        speed: 20,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  const confettiRotate = confettiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const selectedPlanDetails = getSelectedPlanDetails();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      
      {/* Header Background */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 250,
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
      }} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          paddingTop: 60,
        }}>
          {/* Welcome Header */}
          <View style={{ alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 }}>
            <Animated.Text style={{
              fontSize: 42,
              transform: [{ rotate: confettiRotate }],
              marginBottom: 16,
            }}>
              🚀
            </Animated.Text>
            <Text style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: 12,
            }}>
              ¡Perfecto! Ahora elige tu plan
            </Text>
            <Text style={{
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              lineHeight: 24,
            }}>
              Selecciona el plan que mejor se adapte a las necesidades de tu negocio
            </Text>
          </View>

          {/* Plan Cards Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={screenWidth * 0.75 + 20}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: screenWidth * 0.125 - 10,
              paddingVertical: 20,
            }}
          >
            {plans.map((plan, index) => (
              <Animated.View
                key={plan.id}
                style={{
                  transform: [{ scale: scaleAnims[index] }],
                  opacity: fadeAnim,
                }}
              >
                <PlanCard
                  plan={plan}
                  isSelected={selectedPlan === plan.id}
                  onSelect={handleSelectPlan}
                />
              </Animated.View>
            ))}
          </ScrollView>

          {/* Plan Comparison Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              marginBottom: 30,
            }}
            onPress={() => Alert.alert('Comparación de Planes', 'Aquí se mostraría una tabla comparativa detallada')}
          >
            <Ionicons name="analytics-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: '600',
            }}>
              Comparar planes detalladamente
            </Text>
          </TouchableOpacity>

          {/* Selected Plan Summary */}
          {selectedPlan && selectedPlanDetails && (
            <Animated.View style={{
              opacity: fadeAnim,
              marginHorizontal: 20,
              padding: 20,
              backgroundColor: '#f0f9ff',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#bfdbfe',
              marginBottom: 20,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1e40af',
                }}>
                  Plan seleccionado
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: '#1e40af',
                lineHeight: 20,
              }}>
                {selectedPlanDetails.name} - {formatPrice(selectedPlanDetails.price)} + {formatPrice(selectedPlanDetails.monthlyPrice)}/mes
              </Text>
            </Animated.View>
          )}

          {/* Error Message */}
          {error && (
            <View style={{
              marginHorizontal: 20,
              padding: 16,
              backgroundColor: '#fee2e2',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#fecaca',
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 14,
                color: '#dc2626',
              }}>
                {error}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}>
        <TouchableOpacity
          onPress={confirmPlanSelection}
          disabled={loading || !selectedPlan}
          style={{
            backgroundColor: selectedPlan ? colors.primary : '#9ca3af',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={{
                color: '#ffffff',
                fontSize: 17,
                fontWeight: '600',
                marginRight: 8,
              }}>
                Continuar con {selectedPlanDetails?.name}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        {/* Skip Option */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Seleccionar más tarde',
              'Podrás elegir un plan en cualquier momento desde tu perfil',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Continuar sin plan', onPress: () => router.push('./business-setup') }
              ]
            );
          }}
          style={{
            alignItems: 'center',
            marginTop: 12,
          }}
        >
          <Text style={{
            color: colors.textSecondary,
            fontSize: 14,
          }}>
            Decidir más tarde
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}