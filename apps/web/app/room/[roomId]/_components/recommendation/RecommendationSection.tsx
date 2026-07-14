'use client';

import { useState } from 'react';

import Header from '@/components/header';

import RecommendationTypeStep, {
  RecommendationType,
} from './steps/RecommendationTypeStep';

type RecommendationSectionProps = {
  onExit: () => void;
  respondedCount: number;
  onRequestResponse: () => void;
};

function RecommendationSection({
  onExit,
  respondedCount,
  onRequestResponse,
}: RecommendationSectionProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<RecommendationType | null>(null);

  const handleBack = () => {
    if (step === 1) {
      onExit();
      return;
    }
    setStep((prev) => prev - 1);
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="추천 일정" onBack={handleBack} />
      <div className="flex w-full flex-1 flex-col px-5">
        {step === 1 && (
          <RecommendationTypeStep
            value={type}
            onChange={setType}
            onNext={() => setStep(2)}
            respondedCount={respondedCount}
            onRequestResponse={onRequestResponse}
          />
        )}
      </div>
    </div>
  );
}

export default RecommendationSection;
