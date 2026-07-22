'use client';

import { useState } from 'react';

import Header from '@/components/header';
import {
  RecommendationCandidateDetailT,
  RecommendationTypeT,
} from '@/types/recommendation';

import RecommendationConfirmedStep from './steps/RecommendationConfirmedStep';
import RecommendationDetailStep from './steps/RecommendationDetailStep';
import RecommendationResultStep from './steps/RecommendationResultStep';
import RecommendationTypeStep from './steps/RecommendationTypeStep';

type RecommendationSectionProps = {
  roomName: string;
  onExit: () => void;
  respondedCount: number;
  onRequestResponse: () => void;
};

function RecommendationSection({
  roomName,
  onExit,
  respondedCount,
  onRequestResponse,
}: RecommendationSectionProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<RecommendationTypeT | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<RecommendationCandidateDetailT | null>(null);
  const [confirmedCandidate, setConfirmedCandidate] =
    useState<RecommendationCandidateDetailT | null>(null);

  const handleBack = () => {
    if (step === 1 || step === 4) {
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

  const handleConfirm = (candidate: RecommendationCandidateDetailT) => {
    // TODO: 일정 확정 API 호출 예정 (응답/요청 스키마 확정 후 연결)
    setConfirmedCandidate(candidate);
    setStep(4);
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
          <RecommendationResultStep
            type={type}
            onSelectCandidate={handleSelectCandidate}
            onConfirm={handleConfirm}
            onRetry={() => setStep(1)}
          />
        )}
        {step === 3 && selectedCandidate && (
          <RecommendationDetailStep
            roomName={roomName}
            candidate={selectedCandidate}
            onConfirm={handleConfirm}
          />
        )}
        {step === 4 && confirmedCandidate && (
          <RecommendationConfirmedStep
            roomName={roomName}
            candidate={confirmedCandidate}
            onExit={onExit}
          />
        )}
      </div>
    </div>
  );
}

export default RecommendationSection;
