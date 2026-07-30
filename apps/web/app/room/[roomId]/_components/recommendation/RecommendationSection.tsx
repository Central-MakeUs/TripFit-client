'use client';

import { useState } from 'react';

import AlertModal from '@/components/alert-modal';
import Header from '@/components/header';
import {
  RecommendationCandidateDetailT,
  RecommendationTypeT,
} from '@/types/recommendation';

import { MOCK_CANDIDATES } from './_mocks/candidates';
import { useGetRecommendationDetail } from './_hooks/useGetRecommendationDetail';
import { usePostConfirmTrip } from './_hooks/usePostConfirmTrip';
import { usePostRecommendations } from './_hooks/usePostRecommendations';
import RecommendationConfirmedStep from './steps/RecommendationConfirmedStep';
import RecommendationDetailStep from './steps/RecommendationDetailStep';
import RecommendationResultStep from './steps/RecommendationResultStep';
import RecommendationTypeStep from './steps/RecommendationTypeStep';

type RecommendationSectionProps = {
  roomId: string;
  roomName: string;
  myName: string;
  onExit: () => void;
  respondedCount: number;
  onRequestResponse: () => void;
  isConfirmed: boolean;
  onConfirmed?: () => void;
};

function RecommendationSection({
  roomId,
  roomName,
  myName,
  onExit,
  respondedCount,
  onRequestResponse,
  isConfirmed,
  onConfirmed,
}: RecommendationSectionProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<RecommendationTypeT | null>(null);
  const [candidates, setCandidates] = useState<
    RecommendationCandidateDetailT[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<RecommendationCandidateDetailT | null>(null);
  const [confirmedCandidate, setConfirmedCandidate] =
    useState<RecommendationCandidateDetailT | null>(null);
  const { postRecommendationsMutation } = usePostRecommendations();
  const { getRecommendationDetailMutation } = useGetRecommendationDetail();
  const { postConfirmTripMutation } = usePostConfirmTrip();

  if (isConfirmed) {
    // TODO: 실제 확정된 candidate 연동 전까지 임시로 mock 데이터 사용
    const mockConfirmedCandidate = MOCK_CANDIDATES[0];

    return (
      <div className="flex w-full flex-1 flex-col">
        <Header variant="page" title="추천 일정" onBack={onExit} />
        <div className="flex w-full flex-1 flex-col px-5">
          {mockConfirmedCandidate && (
            <RecommendationConfirmedStep
              roomName={roomName}
              candidate={mockConfirmedCandidate}
              onExit={onExit}
              readOnly
            />
          )}
        </div>
      </div>
    );
  }

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
    getRecommendationDetailMutation(
      { roomId, rank: candidate.rank, myName },
      {
        onSuccess: (detail) => {
          setSelectedCandidate({ ...candidate, ...detail });
          setStep(3);
        },
        onError: () => setErrorMessage('추천 근거를 불러오지 못했어요'),
      },
    );
  };

  const handleConfirm = (candidate: RecommendationCandidateDetailT) => {
    postConfirmTripMutation(
      { roomId, recommendationRank: candidate.rank },
      {
        onSuccess: () => {
          onConfirmed?.();
          setConfirmedCandidate(candidate);
          setStep(4);
        },
        onError: () => setErrorMessage('일정을 확정하지 못했어요'),
      },
    );
  };

  const handleGenerateRecommendations = () => {
    if (!type) return;
    postRecommendationsMutation(
      { roomId, type },
      {
        onSuccess: (data) => {
          setCandidates(data);
          setStep(2);
        },
        onError: () => setErrorMessage('추천 일정을 불러오지 못했어요'),
      },
    );
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="추천 일정" onBack={handleBack} />
      <div className="flex w-full flex-1 flex-col px-5">
        {step === 1 && (
          <RecommendationTypeStep
            value={type}
            onChange={setType}
            onNext={handleGenerateRecommendations}
            respondedCount={respondedCount}
            onRequestResponse={onRequestResponse}
          />
        )}
        {step === 2 && type && (
          <RecommendationResultStep
            type={type}
            candidates={candidates}
            onSelectCandidate={handleSelectCandidate}
            onConfirm={handleConfirm}
            onRetry={() => setStep(1)}
          />
        )}
        {step === 3 && selectedCandidate && (
          <RecommendationDetailStep
            roomId={roomId}
            roomName={roomName}
            candidate={selectedCandidate}
            onConfirm={handleConfirm}
            onFeedbackError={setErrorMessage}
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

      <AlertModal
        open={errorMessage !== null}
        onOpenChange={(open) => !open && setErrorMessage(null)}
        variant="danger"
        title={errorMessage ?? ''}
        description="잠시 후 다시 시도해주세요"
        primaryText="확인"
        onPrimaryClick={() => setErrorMessage(null)}
      />
    </div>
  );
}

export default RecommendationSection;
