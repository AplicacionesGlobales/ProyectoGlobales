import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Plan } from '../../types/plan.types';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: (planId: string) => void;
  animatedScale?: any;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isSelected,
  onSelect,
  animatedScale,
}) => {
  const { colors } = useTheme();

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  return (
    <TouchableOpacity
      onPress={() => onSelect(plan.id)}
      activeOpacity={0.9}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 10,
        width: screenWidth * 0.75,
        minHeight: 400,
        borderWidth: isSelected ? 3 : 1,
        borderColor: isSelected ? plan.color : '#e5e7eb',
        shadowColor: isSelected ? plan.color : '#000',
        shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
        shadowOpacity: isSelected ? 0.3 : 0.1,
        shadowRadius: isSelected ? 15 : 8,
        elevation: isSelected ? 10 : 5,
        position: 'relative',
      }}
    >
      {/* Recommended Badge */}
      {plan.recommended && (
        <View style={{
          position: 'absolute',
          top: -12,
          alignSelf: 'center',
          backgroundColor: '#fbbf24',
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Ionicons name="star" size={14} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={{ 
            color: '#ffffff', 
            fontSize: 12, 
            fontWeight: 'bold' 
          }}>
            RECOMENDADO
          </Text>
        </View>
      )}

      {/* Plan Header */}
      <View style={{ alignItems: 'center', marginBottom: 20, marginTop: plan.recommended ? 10 : 0 }}>
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: `${plan.color}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Ionicons name={plan.icon as any} size={30} color={plan.color} />
        </View>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text,
          marginBottom: 4,
        }}>
          {plan.name}
        </Text>
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          {plan.description}
        </Text>
      </View>

      {/* Pricing */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text style={{
          fontSize: 36,
          fontWeight: 'bold',
          color: plan.color,
        }}>
          {formatPrice(plan.price)}
        </Text>
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
        }}>
          + {formatPrice(plan.monthlyPrice)}/mes
        </Text>
        {plan.id === 'starter' && (
          <Text style={{
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 4,
          }}>
            Pago único + mensualidad
          </Text>
        )}
      </View>

      {/* Features */}
      <View style={{ flex: 1 }}>
        {plan.features.slice(0, 5).map((feature, idx) => (
          <View key={idx} style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
            <Ionicons 
              name="checkmark-circle" 
              size={18} 
              color={plan.color} 
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontSize: 14,
              color: colors.text,
              flex: 1,
            }}>
              {feature}
            </Text>
          </View>
        ))}
        {plan.features.length > 5 && (
          <Text style={{
            fontSize: 12,
            color: plan.color,
            fontWeight: '600',
            marginTop: 8,
          }}>
            +{plan.features.length - 5} más características
          </Text>
        )}
      </View>

      {/* Selection Indicator */}
      {isSelected && (
        <View style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: plan.color,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="checkmark" size={18} color="#ffffff" />
        </View>
      )}
    </TouchableOpacity>
  );
};