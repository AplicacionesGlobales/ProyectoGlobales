// components/Auth/ForgotPassword/ForgotPasswordForm.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { StepIndicator } from './StepIndicator';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { StepThree } from './StepThree';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBackToLogin,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [validatedCode, setValidatedCode] = useState('');

  const handleStepOneNext = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentStep(2);
  };

  const handleStepTwoNext = (code: string) => {
    setValidatedCode(code);
    setCurrentStep(3);
  };

  const handleStepThreeSuccess = () => {
    onSuccess?.();
  };

  const handleBackToStepOne = () => {
    setCurrentStep(1);
    setEmail('');
    setValidatedCode('');
  };

  const handleBackToStepTwo = () => {
    setCurrentStep(2);
    setValidatedCode('');
  };

  return (
    <View>
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step Content */}
      {currentStep === 1 && (
        <StepOne
          onNext={handleStepOneNext}
          onBack={onBackToLogin || (() => {})}
        />
      )}

      {currentStep === 2 && (
        <StepTwo
          email={email}
          onNext={handleStepTwoNext}
          onBack={handleBackToStepOne}
        />
      )}

      {currentStep === 3 && (
        <StepThree
          email={email}
          code={validatedCode}
          onSuccess={handleStepThreeSuccess}
          onBack={handleBackToStepTwo}
        />
      )}
    </View>
  );
};