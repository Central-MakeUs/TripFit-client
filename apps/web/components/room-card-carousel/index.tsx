'use client';

import { type PointerEvent, useRef, useState } from 'react';

import Pagination from '@/components/pagination';
import RoomCard, { type RoomCardProps } from '@/components/room-card';
import { cn } from '@/utils/cn';

const CARD_WIDTH = 320;
const CARD_GAP = 16;

type RoomCardCarouselProps = {
  className?: string;
  items: RoomCardProps[];
};

const SCROLL_DURATION = 400;
// ease-out은 클릭한 순간 최고 속도로 튀어나가듯 시작해서 "훅 튕기는" 느낌을 준다.
// ease-in-out은 천천히 붙었다가 붙었다가 천천히 멈춰서 훨씬 "물 흐르듯" 자연스럽게 느껴진다.
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

function RoomCardCarousel({ className, items }: RoomCardCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startScrollLeft: number; startX: number } | null>(
    null,
  );
  const scrollAnimationRef = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / (CARD_WIDTH + CARD_GAP));
    setCurrent(Math.min(Math.max(index, 0), items.length - 1));
  };

  // snap-mandatory가 켜진 채로 scrollTo(behavior: 'smooth')를 호출하면
  // 크로미움이 목표까지 한 번에 미끄러지지 않고 카드 경계마다 멈칫거리며 이동한다.
  // 브라우저 스크롤 애니메이션 대신 scrollLeft를 직접 easing으로 움직여서 매끄럽게 만든다.
  const handleDotClick = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    if (scrollAnimationRef.current !== null)
      cancelAnimationFrame(scrollAnimationRef.current);

    const startLeft = container.scrollLeft;
    const targetLeft = index * (CARD_WIDTH + CARD_GAP);
    const startTime = performance.now();
    container.style.scrollSnapType = 'none';
    setCurrent(index);

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);
      container.scrollLeft =
        startLeft + (targetLeft - startLeft) * easeInOutCubic(progress);
      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimationRef.current = null;
        container.style.scrollSnapType = '';
      }
    };
    scrollAnimationRef.current = requestAnimationFrame(step);
  };

  // 마우스는 스크롤 컨테이너를 드래그해도 네이티브 스크롤이 발생하지 않으므로 직접 따라가게 해준다.
  // 터치는 네이티브 스크롤(관성 포함)이 이미 동작하므로 건드리지 않는다.
  // 드래그 중에는 scroll-snap이 매 프레임 가장 가까운 카드로 되돌리려고 해서 움직임을 상쇄시키므로 잠시 꺼둔다.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || event.pointerType !== 'mouse') return;
    dragRef.current = {
      startScrollLeft: container.scrollLeft,
      startX: event.clientX,
    };
    container.setPointerCapture(event.pointerId);
    container.style.scrollSnapType = 'none';
    container.style.scrollBehavior = 'auto';
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const drag = dragRef.current;
    if (!container || !drag || event.pointerType !== 'mouse') return;
    container.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (container && event.pointerType === 'mouse') {
      container.releasePointerCapture(event.pointerId);
      container.style.scrollSnapType = '';
      container.style.scrollBehavior = '';
    }
    dragRef.current = null;
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto active:cursor-grabbing"
      >
        {items.map((item, index) => (
          <RoomCard
            key={`${item.type}-${index}`}
            {...item}
            className="snap-start"
          />
        ))}
      </div>
      {items.length > 1 && (
        <Pagination
          className="justify-center"
          total={items.length}
          current={current}
          onDotClick={handleDotClick}
        />
      )}
    </div>
  );
}

export default RoomCardCarousel;
