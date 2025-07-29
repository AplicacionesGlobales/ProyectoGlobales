import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface IonIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: any;
}

export const IonIcon: React.FC<IonIconProps> = ({ name, size = 24, color = '#000', style }) => {
  return <Ionicons name={name} size={size} color={color} style={style} />;
};
