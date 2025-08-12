import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { 
  LoadingSpinner,
  LoadingScreen,
  LoadingOverlay,
  LoadingState
} from '../../components/ui/loading';
import { Button } from '../../components/ui/Button';
import { useLoading } from '../../hooks/useLoading';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

export default function LoadingExamples() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  
  const {
    loading: buttonLoading,
    startLoading: startButtonLoading,
    stopLoading: stopButtonLoading,
    withLoading
  } = useLoading();

  const simulateApiCall = async () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  };

  const handleAsyncAction = async () => {
    await withLoading(simulateApiCall);
  };

  const showOverlay = () => {
    setOverlayVisible(true);
    setTimeout(() => setOverlayVisible(false), 3000);
  };

  const toggleLoadingScreen = () => {
    setShowLoadingScreen(true);
    setTimeout(() => setShowLoadingScreen(false), 3000);
  };

  const toggleListLoading = () => {
    setListLoading(true);
    setTimeout(() => setListLoading(false), 2000);
  };

  if (showLoadingScreen) {
    return (
      <LoadingScreen 
        message="Cargando contenido..."
        spinnerColor="#3B82F6"
      />
    );
  }

  return (
    <StyledView className="flex-1 bg-white">
      <StyledScrollView className="p-6">
        <StyledText className="text-2xl font-bold mb-6 text-gray-900">
          Ejemplos de Loading
        </StyledText>

        {/* LoadingSpinner Examples */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4 text-gray-800">
            1. Loading Spinner
          </StyledText>
          <StyledView className="flex-row justify-around items-center p-4 bg-gray-50 rounded-lg">
            <StyledView className="items-center">
              <LoadingSpinner size="small" />
              <StyledText className="text-sm mt-2 text-gray-600">Small</StyledText>
            </StyledView>
            <StyledView className="items-center">
              <LoadingSpinner size="large" />
              <StyledText className="text-sm mt-2 text-gray-600">Large</StyledText>
            </StyledView>
            <StyledView className="items-center">
              <LoadingSpinner size="large" color="#10B981" />
              <StyledText className="text-sm mt-2 text-gray-600">Custom Color</StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Button con Loading Examples */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4 text-gray-800">
            2. Botones con Loading
          </StyledText>
          <StyledView className="space-y-3">
            <Button
              title="Botón con Loading"
              loading={buttonLoading}
              onPress={handleAsyncAction}
              variant="solid"
              color="primary"
              fullWidth
            />
            
            <Button
              title="Botón Outline"
              loading={buttonLoading}
              onPress={handleAsyncAction}
              variant="outline"
              color="success"
              fullWidth
            />
            
            <Button
              title="Botón Ghost"
              loading={buttonLoading}
              onPress={handleAsyncAction}
              variant="ghost"
              color="warning"
              fullWidth
            />
          </StyledView>
        </StyledView>

        {/* LoadingState Examples */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4 text-gray-800">
            3. Loading State
          </StyledText>
          
          <Button
            title={listLoading ? "Cargando..." : "Cargar Lista"}
            onPress={toggleListLoading}
            variant="outline"
            color="info"
            className="mb-4"
          />

          <LoadingState
            loading={listLoading}
            message="Cargando elementos..."
            variant="spinner"
          >
            <StyledView className="p-4 bg-gray-50 rounded-lg">
              <StyledText className="text-gray-700">Lista de elementos:</StyledText>
              <StyledText className="text-gray-600 mt-2">• Elemento 1</StyledText>
              <StyledText className="text-gray-600">• Elemento 2</StyledText>
              <StyledText className="text-gray-600">• Elemento 3</StyledText>
            </StyledView>
          </LoadingState>
        </StyledView>

        {/* Action Buttons */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4 text-gray-800">
            4. Otros Componentes
          </StyledText>
          <StyledView className="space-y-3">
            <Button
              title="Mostrar Loading Overlay"
              onPress={showOverlay}
              variant="solid"
              color="secondary"
              fullWidth
            />
            
            <Button
              title="Mostrar Loading Screen"
              onPress={toggleLoadingScreen}
              variant="solid"
              color="primary"
              fullWidth
            />
          </StyledView>
        </StyledView>

        {/* Hook Example */}
        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4 text-gray-800">
            5. Hook useLoading
          </StyledText>
          <StyledView className="p-4 bg-gray-50 rounded-lg">
            <StyledText className="text-gray-600 mb-2">
              Estado actual: {buttonLoading ? 'Cargando' : 'Inactivo'}
            </StyledText>
            <StyledView className="flex-row space-x-2">
              <Button
                title="Iniciar"
                onPress={startButtonLoading}
                size="sm"
                variant="outline"
                color="success"
                disabled={buttonLoading}
              />
              <Button
                title="Detener"
                onPress={stopButtonLoading}
                size="sm"
                variant="outline"
                color="error"
                disabled={!buttonLoading}
              />
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={overlayVisible}
        message="Procesando solicitud..."
        spinnerColor="#3B82F6"
      />
    </StyledView>
  );
}
