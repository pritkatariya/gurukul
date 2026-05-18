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
    <div className="w-full max-w-2xl bg-white shadow-[0_20px_50px_rgba(153,27,27,0.03)] border border-red-50 rounded-[2.5rem] p-8 mt-5 select-none">
      
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center w-full last:w-auto">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-black text-sm border-2 transition-all duration-300 ${
              currentStep >= step.id 
                ? 'bg-red-800 text-white border-red-800 shadow-md shadow-red-100' 
                : 'bg-white text-gray-400 border-gray-200'
            }`}>
              {step.id}
            </div>
            
            <span className={`ml-2 text-xs font-black uppercase tracking-wider hidden sm:inline whitespace-nowrap ${
              currentStep >= step.id ? 'text-red-950' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                currentStep > step.id ? 'bg-red-800' : 'bg-gray-200'
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
            className={`px-6 h-12 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 active:scale-95'
            }`}
          >
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 h-12 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 h-12 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Submit & Create
            </button>
          )}
        </div>

      </form>
    </div>
  );
}