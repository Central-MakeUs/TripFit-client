'use client';

import { useState } from 'react';

import Header from '@/components/header';

import RecommendationConfirmStep from './steps/RecommendationConfirmStep';
import RecommendationTypeStep, {
  RecommendationType,
} from './steps/RecommendationTypeStep';

type RecommendationSectionProps = {
  onExit: () => void;
  onConfirm: () => void;
  respondedCount: number;
  onRequestResponse: () => void;
};

function RecommendationSection({
  onExit,
  onConfirm,
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
        {step === 2 && type && (
          <RecommendationConfirmStep
            type={type}
            onSelectCandidate={() => {
              /* TODO: 후보 상세보기(3단계)는 다음 커밋에서 연결 */
            }}
            onConfirm={onConfirm}
            onRetry={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}

export default RecommendationSection;
