import React, { useState } from 'react';

interface Step {
  id: number;
  label: string;
}

interface CreateFormCardProps {
  steps: Step[];
  children: (
    currentStep: number, 
    nextStep: () => void, 
    prevStep: () => void
  ) => React.ReactNode;
  onSubmit: () => void;
  onValidateStep: (step: number) => boolean;
}

export default function CreateFormCard({
  steps,
  children,
  onSubmit,
  onValidateStep,
}: CreateFormCardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleNext = () => {
    if (onValidateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onValidateStep(currentStep)) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 mt-5">
      
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center w-full last:w-auto">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm border-2 transition-all duration-300 ${
              currentStep >= step.id 
                ? 'bg-red-700 text-white border-red-700 shadow-md shadow-red-100' 
                : 'bg-white text-gray-400 border-gray-200'
            }`}>
              {step.id}
            </div>
            
            <span className={`ml-2 text-sm font-semibold hidden sm:inline whitespace-nowrap ${
              currentStep >= step.id ? 'text-red-900' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                currentStep > step.id ? 'bg-red-700' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="min-h-30">
          {children(currentStep, handleNext, handleBack)}
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-semibold text-sm shadow-md shadow-red-100 transition-all active:scale-95"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-semibold text-sm shadow-md shadow-red-100 transition-all active:scale-95"
            >
              Submit & Create
            </button>
          )}
        </div>

      </form>
    </div>
  );
}