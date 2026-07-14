'use client';

import { ReactNode, useRef, useState } from 'react';

import ReplayIcon from '@/assets/icons/replay.svg';
import Button from '@/components/button';
import Pagination from '@/components/pagination';
import TextButton from '@/components/text-button';

import RecommendationCandidateCard, {
  RecommendationCandidate,
} from '../RecommendationCandidateCard';
import { RecommendationType } from './RecommendationTypeStep';

const CARD_WIDTH = 292;
const CARD_GAP = 6;

// TODO: 디자인 시안에 맞는 문구로 교체
const RECOMMENDATION_TYPE_CONFIRM_HEADLINE: Record<
  RecommendationType,
  ReactNode
> = {
  default: (
    <>
      참석률과 연차를 균형 있게
      <br />
      고려한 추천 결과예요
    </>
  ),
  allAttend: (
    <>
      가능한 많은 인원이
      <br />
      함께할 수 있는 날짜예요
    </>
  ),
  saveLeave: (
    <>
      연차 사용을
      <br />
      최소화한 날짜예요
    </>
  ),
  certain: (
    <>
      일정이 불확실한 인원이 적어,
      <br />
      변동 위험이 가장 낮은 날짜예요
    </>
  ),
};

// TODO: 실제 API 연동 전까지 사용하는 임시 데이터
const MOCK_CANDIDATES: RecommendationCandidate[] = [
  {
    id: 'candidate-1',
    rank: 1,
    startDate: '2026-06-12',
    endDate: '2026-06-15',
    attendanceRate: 80,
    uncertainCount: 1,
    partialCount: 1,
    leaveCount: 2,
  },
  {
    id: 'candidate-2',
    rank: 2,
    startDate: '2026-06-19',
    endDate: '2026-06-22',
    attendanceRate: 70,
    uncertainCount: 2,
    partialCount: 1,
    leaveCount: 3,
  },
  {
    id: 'candidate-3',
    rank: 3,
    startDate: '2026-06-26',
    endDate: '2026-06-29',
    attendanceRate: 60,
    uncertainCount: 2,
    partialCount: 2,
    leaveCount: 2,
  },
];

type RecommendationConfirmStepProps = {
  type: RecommendationType;
  onSelectCandidate: (candidateId: string) => void;
  onConfirm: () => void;
  onRetry: () => void;
};

function RecommendationConfirmStep({
  type,
  onSelectCandidate,
  onConfirm,
  onRetry,
}: RecommendationConfirmStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / (CARD_WIDTH + CARD_GAP));
    setCurrent(Math.min(Math.max(index, 0), MOCK_CANDIDATES.length - 1));
  };

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-body-01 pt-6">
        {RECOMMENDATION_TYPE_CONFIRM_HEADLINE[type]}
      </h2>
      <div className="w-full" style={{ flexGrow: 52 }} />
      <div className="flex flex-col gap-2">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-1.5 overflow-x-auto"
        >
          {MOCK_CANDIDATES.map((candidate) => (
            <RecommendationCandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => onSelectCandidate(candidate.id)}
              className="snap-center first:ml-[calc(50%-146px)] last:mr-[calc(50%-146px)]"
            />
          ))}
        </div>
        {MOCK_CANDIDATES.length > 1 && (
          <Pagination
            className="justify-center"
            total={MOCK_CANDIDATES.length}
            current={current}
          />
        )}
      </div>
      <div className="w-full" style={{ flexGrow: 45 }} />
      <div className="w-full py-2 space-y-2">
        <Button text="일정 확정하기" onClick={onConfirm} className="w-full" />
        <TextButton
          text="다시 추천받기"
          icon={<ReplayIcon className="size-5 text-grey-500" />}
          onClick={onRetry}
          size="L"
          className="mx-auto"
        />
      </div>
    </div>
  );
}

export default RecommendationConfirmStep;
