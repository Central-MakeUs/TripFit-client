'use client';

import { useState } from 'react';

import Header from '@/components/header';
import {
  RecommendationCandidateDetailT,
  RecommendationTypeT,
} from '@/types/recommendation';

import RecommendationConfirmStep from './steps/RecommendationConfirmStep';
import RecommendationDetailStep from './steps/RecommendationDetailStep';
import RecommendationTypeStep from './steps/RecommendationTypeStep';

type RecommendationSectionProps = {
  roomName: string;
  onExit: () => void;
  onConfirm: () => void;
  respondedCount: number;
  onRequestResponse: () => void;
};

function RecommendationSection({
  roomName,
  onExit,
  onConfirm,
  respondedCount,
  onRequestResponse,
}: RecommendationSectionProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<RecommendationTypeT | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<RecommendationCandidateDetailT | null>(null);

  const handleBack = () => {
    if (step === 1) {
      onExit();
      return;
    }
    if (step === 3) {
      setSelectedCandidate(null);
      setStep(2);
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleSelectCandidate = (candidate: RecommendationCandidateDetailT) => {
    setSelectedCandidate(candidate);
    setStep(3);
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
            onSelectCandidate={handleSelectCandidate}
            onConfirm={onConfirm}
            onRetry={() => setStep(1)}
          />
        )}
        {step === 3 && selectedCandidate && (
          <RecommendationDetailStep
            roomName={roomName}
            candidate={selectedCandidate}
            onConfirm={onConfirm}
          />
        )}
      </div>
    </div>
  );
}

export default RecommendationSection;
