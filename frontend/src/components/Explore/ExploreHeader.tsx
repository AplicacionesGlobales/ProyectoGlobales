import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ExploreHeaderProps {
  title: string;
  subtitle: string;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({ title, subtitle }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    header: {
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: 60,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    headerSubtext: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 16,
    },
  });

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
      <Text style={styles.headerSubtext}>{subtitle}</Text>
    </View>
  );
};