import { useApp } from '@/contexts/AppContext';
import { ThemeColors, useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ThemeCustomizationScreen() {
  const { colors, updateColors, resetToDefault } = useTheme();
  const { user } = useApp();
  const [customColors, setCustomColors] = useState<ThemeColors>(colors);

  if (!user || user.role !== 'admin') {
    router.push('/' as any);
    return null;
  }

  const colorOptions = [
    { name: 'primary', label: '🎨 Color Primario', description: 'Color principal de la app' },
    { name: 'secondary', label: '🎯 Color Secundario', description: 'Color de elementos secundarios' },
    { name: 'accent', label: '✨ Color de Acento', description: 'Color para botones y destacados' },
    { name: 'background', label: '🖼️ Fondo', description: 'Color de fondo general' },
    { name: 'surface', label: '📄 Superficie', description: 'Color de tarjetas y paneles' },
    { name: 'text', label: '📝 Texto Principal', description: 'Color del texto principal' },
    { name: 'textSecondary', label: '📖 Texto Secundario', description: 'Color del texto secundario' },
    { name: 'success', label: '✅ Éxito', description: 'Color para mensajes de éxito' },
    { name: 'warning', label: '⚠️ Advertencia', description: 'Color para advertencias' },
    { name: 'error', label: '❌ Error', description: 'Color para errores' },
  ];

  const presetThemes = [
    {
      name: 'Azul Moderno',
      colors: {
        primary: '#2563EB',
        secondary: '#6B7280',
        accent: '#06B6D4',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      }
    },
    {
      name: 'Verde Minimalista',
      colors: {
        primary: '#059669',
        secondary: '#6B7280',
        accent: '#06B6D4',
        background: '#F9FDF9',
        surface: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      }
    },
    {
      name: 'Gris Profesional',
      colors: {
        primary: '#374151',
        secondary: '#6B7280',
        accent: '#2563EB',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      }
    },
    {
      name: 'Índigo Elegante',
      colors: {
        primary: '#4F46E5',
        secondary: '#6B7280',
        accent: '#06B6D4',
        background: '#FAFAFF',
        surface: '#FFFFFF',
        text: '#111827',
        textSecondary: '#6B7280',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      }
    },
  ];

  const handleColorChange = (colorName: keyof ThemeColors, value: string) => {
    // Validar que sea un color hexadecimal válido
    if (!/^#[0-9A-F]{6}$/i.test(value) && value.length === 7) {
      return;
    }
    setCustomColors(prev => ({
      ...prev,
      [colorName]: value
    }));
  };

  const applyTheme = () => {
    updateColors(customColors);
    Alert.alert('✅ Tema Aplicado', 'Los cambios se han aplicado correctamente');
  };

  const applyPreset = (preset: any) => {
    setCustomColors(preset.colors);
    updateColors(preset.colors);
    Alert.alert('🎨 Tema Aplicado', `Se ha aplicado el tema "${preset.name}"`);
  };

  const handleReset = () => {
    Alert.alert(
      'Restaurar Tema',
      '¿Estás seguro que deseas restaurar el tema por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Restaurar', 
          style: 'destructive', 
          onPress: () => {
            resetToDefault();
            setCustomColors(colors);
            Alert.alert('🔄 Tema Restaurado', 'Se ha restaurado el tema por defecto');
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    backButton: {
      marginBottom: 16,
    },
    backButtonText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    presetContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    presetButton: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      minWidth: '45%',
      alignItems: 'center',
    },
    presetButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    colorItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    colorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    colorPreview: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    colorLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    colorDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    colorInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      fontFamily: 'monospace',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    actionButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    applyButton: {
      backgroundColor: colors.primary,
    },
    resetButton: {
      backgroundColor: colors.secondary,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Personalizar Tema</Text>
        <Text style={styles.headerSubtext}>Configura los colores de tu app</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Temas Predefinidos</Text>
          <View style={styles.presetContainer}>
            {presetThemes.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.presetButton, { backgroundColor: preset.colors.primary + '15' }]}
                onPress={() => applyPreset(preset)}
              >
                <Text style={[styles.presetButtonText, { color: preset.colors.primary }]}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎛️ Personalización Avanzada</Text>
          {colorOptions.map((option) => (
            <View key={option.name} style={styles.colorItem}>
              <View style={styles.colorHeader}>
                <View 
                  style={[
                    styles.colorPreview, 
                    { backgroundColor: customColors[option.name as keyof ThemeColors] }
                  ]} 
                />
                <Text style={styles.colorLabel}>{option.label}</Text>
              </View>
              <Text style={styles.colorDescription}>{option.description}</Text>
              <TextInput
                style={styles.colorInput}
                value={customColors[option.name as keyof ThemeColors]}
                onChangeText={(value) => handleColorChange(option.name as keyof ThemeColors, value)}
                placeholder="#000000"
                maxLength={7}
                autoCapitalize="characters"
              />
            </View>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.applyButton]}
            onPress={applyTheme}
          >
            <Text style={styles.actionButtonText}>Aplicar Cambios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.actionButtonText}>Restaurar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
