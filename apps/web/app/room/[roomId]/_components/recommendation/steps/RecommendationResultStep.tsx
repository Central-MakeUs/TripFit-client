'use client';

import { ReactNode, useRef, useState } from 'react';

import ReplayIcon from '@/assets/icons/replay.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import Pagination from '@/components/pagination';
import {
  RecommendationCandidateDetailT,
  RecommendationTypeT,
} from '@/types/recommendation';

import RecommendationCandidateCard from './_components/RecommendationCandidateCard';

const CARD_WIDTH = 292;
const CARD_GAP = 6;

const RECOMMENDATION_TYPE_CONFIRM_HEADLINE: Record<
  RecommendationTypeT,
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

type RecommendationResultStepProps = {
  type: RecommendationTypeT;
  candidates: RecommendationCandidateDetailT[];
  onSelectCandidate: (candidate: RecommendationCandidateDetailT) => void;
  onConfirm: (candidate: RecommendationCandidateDetailT) => void;
  onRetry: () => void;
};

function RecommendationResultStep({
  type,
  candidates,
  onSelectCandidate,
  onConfirm,
  onRetry,
}: RecommendationResultStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const activeCandidate = candidates[current] ?? candidates[0];

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / (CARD_WIDTH + CARD_GAP));
    setCurrent(Math.min(Math.max(index, 0), candidates.length - 1));
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
          {candidates.map((candidate, index) => (
            <RecommendationCandidateCard
              key={candidate.id}
              candidate={candidate}
              active={index === current}
              onClick={() => onSelectCandidate(candidate)}
              className="snap-center first:ml-[calc(50%-146px)] last:mr-[calc(50%-146px)]"
            />
          ))}
        </div>
        {candidates.length > 1 && (
          <Pagination
            className="justify-center"
            total={candidates.length}
            current={current}
          />
        )}
      </div>
      <div className="w-full" style={{ flexGrow: 45 }} />
      <CtaButtonGroup
        primaryText="일정 확정하기"
        onPrimaryClick={() => activeCandidate && onConfirm(activeCandidate)}
        secondaryText="다시 추천받기"
        secondaryVariant="text-link"
        secondaryIcon={<ReplayIcon className="size-4 text-grey-500" />}
        onSecondaryClick={onRetry}
        className="px-0"
      />
    </div>
  );
}

export default RecommendationResultStep;
