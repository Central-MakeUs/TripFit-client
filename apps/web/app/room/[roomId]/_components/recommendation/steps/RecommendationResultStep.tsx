'use client';

import { type PointerEvent, ReactNode, useRef, useState } from 'react';

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
const DRAG_THRESHOLD = 5;

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
  const dragRef = useRef<{
    isDragging: boolean;
    pointerId: number;
    startScrollLeft: number;
    startX: number;
  } | null>(null);
  // 포인터 캡처와 scrollLeft 조작만으로는 pointerup 뒤에 이어지는 click 이벤트가
  // 취소되지 않는다 — 카드 위에서 드래그가 임계값을 넘으면 이 플래그를 세워 그
  // click에서 onSelectCandidate가 호출되지 않도록 막는다.
  const suppressClickRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const activeCandidate = candidates[current] ?? candidates[0];

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / (CARD_WIDTH + CARD_GAP));
    setCurrent(Math.min(Math.max(index, 0), candidates.length - 1));
  };

  // 마우스는 스크롤 컨테이너를 드래그해도 네이티브 스크롤이 발생하지 않으므로 직접
  // 따라가게 해준다(데스크톱 브라우저에서는 이게 없으면 카드가 아예 안 넘어간다).
  // 터치는 네이티브 스크롤(관성 포함)이 이미 동작하므로 건드리지 않는다.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    // 오른쪽/보조 버튼(컨텍스트 메뉴 등)까지 드래그로 취급하면 안 된다 — 기본
    // 왼쪽 버튼(button === 0)만 캐러셀 드래그로 처리한다.
    if (!container || event.pointerType !== 'mouse' || event.button !== 0)
      return;
    // 새 제스처 시작 — 직전 드래그의 억제 플래그가 어떤 이유로든 소비되지 못하고
    // 남아있다면 여기서 초기화해 다음 정상 클릭까지 막히지 않게 한다.
    suppressClickRef.current = false;
    dragRef.current = {
      isDragging: false,
      pointerId: event.pointerId,
      startScrollLeft: container.scrollLeft,
      startX: event.clientX,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const drag = dragRef.current;
    if (!container || !drag || event.pointerType !== 'mouse') return;
    const delta = event.clientX - drag.startX;

    // DRAG_THRESHOLD 이전에는 캡처를 시작하지 않아, 단순 클릭이 카드의 onClick으로
    // 정상적으로 전달된다.
    if (!drag.isDragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      drag.isDragging = true;
      suppressClickRef.current = true;
      container.setPointerCapture(drag.pointerId);
      container.style.scrollSnapType = 'none';
      container.style.scrollBehavior = 'auto';
    }
    container.scrollLeft = drag.startScrollLeft - delta;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const drag = dragRef.current;
    if (container && drag?.isDragging && event.pointerType === 'mouse') {
      container.releasePointerCapture(drag.pointerId);
      container.style.scrollBehavior = '';

      const restoreSnap = () => {
        container.style.scrollSnapType = '';
      };

      const step = CARD_WIDTH + CARD_GAP;
      const index = Math.round(container.scrollLeft / step);
      const targetLeft = Math.max(
        0,
        Math.min(index * step, container.scrollWidth - container.clientWidth),
      );

      if (Math.round(container.scrollLeft) === Math.round(targetLeft)) {
        restoreSnap();
      } else if ('onscrollend' in container) {
        container.addEventListener('scrollend', restoreSnap, { once: true });
      } else {
        setTimeout(restoreSnap, 400);
      }
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
    dragRef.current = null;
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="no-scrollbar -mx-5 flex cursor-grab snap-x snap-mandatory gap-1.5 overflow-x-auto active:cursor-grabbing"
        >
          {candidates.map((candidate, index) => (
            <RecommendationCandidateCard
              key={candidate.id}
              candidate={candidate}
              active={index === current}
              onClick={() => {
                if (suppressClickRef.current) {
                  suppressClickRef.current = false;
                  return;
                }
                onSelectCandidate(candidate);
              }}
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
