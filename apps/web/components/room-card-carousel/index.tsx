'use client';

import { type PointerEvent, useEffect, useRef, useState } from 'react';

import Pagination from '@/components/pagination';
import RoomCard, { type RoomCardProps } from '@/components/room-card';
import { cn } from '@/utils/cn';

type RoomCardCarouselProps = {
  className?: string;
  items: RoomCardProps[];
};

const DRAG_THRESHOLD = 5;

function RoomCardCarousel({ className, items }: RoomCardCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    pointerId: number;
    startScrollLeft: number;
    startX: number;
  } | null>(null);
  // 카드 1개 + gap의 실제 렌더 너비(px). 카드 너비가 화면 폭에 따라 반응형으로
  // 변하므로 고정 상수 대신 DOM에서 매번 측정한다.
  const stepRef = useRef(0);
  // 카드가 snap-center라 뷰포트 중앙에 오도록 스크롤되므로, "카드 왼쪽 끝 기준" 위치와
  // "가운데 정렬 기준" 스크롤 위치 사이에 (뷰포트 너비 - 카드 너비)/2 만큼 차이가 난다.
  // 이 상수를 알아야 몇 번째 카드가 지금 중앙에 있는지 계산할 수 있다.
  const centerOffsetRef = useRef(0);
  // 컨테이너 좌측 패딩(px-5)만큼 첫 카드가 0이 아닌 위치에서 시작하므로,
  // scrollLeft ↔ index 상호 변환 시 이 오프셋을 함께 보정해야 한다.
  const firstOffsetRef = useRef(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const first = container.children[0] as HTMLElement | undefined;
      const second = container.children[1] as HTMLElement | undefined;
      if (!first) return;
      stepRef.current = second
        ? second.offsetLeft - first.offsetLeft
        : first.getBoundingClientRect().width;
      centerOffsetRef.current =
        (container.clientWidth - first.getBoundingClientRect().width) / 2;
      firstOffsetRef.current = first.offsetLeft;
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [items.length]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || !stepRef.current) return;
    const index = Math.round(
      (container.scrollLeft +
        centerOffsetRef.current -
        firstOffsetRef.current) /
        stepRef.current,
    );
    setCurrent(Math.min(Math.max(index, 0), items.length - 1));
  };

  // 마우스는 스크롤 컨테이너를 드래그해도 네이티브 스크롤이 발생하지 않으므로 직접 따라가게 해준다.
  // 터치는 네이티브 스크롤(관성 포함)이 이미 동작하므로 건드리지 않는다.
  // 드래그 중에는 scroll-snap이 매 프레임 가장 가까운 카드로 되돌리려고 해서 움직임을 상쇄시키므로 잠시 꺼둔다.
  // pointerdown 즉시 캡처하면 카드 안의 핀/공유 버튼 같은 중첩 요소로 클릭이 전달되지 않으므로,
  // 실제로 DRAG_THRESHOLD 이상 움직였을 때만 드래그로 간주해 캡처를 시작한다.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || event.pointerType !== 'mouse') return;
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

    if (!drag.isDragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      drag.isDragging = true;
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
      container.style.scrollSnapType = '';
      container.style.scrollBehavior = '';

      // scrollLeft를 코드로 직접 움직인 드래그라 브라우저가 "스크롤이 끝났다"는
      // 네이티브 제스처로 인식하지 못해 scroll-snap이 알아서 스냅해주지 않는다.
      // 놓인 위치에서 가장 가까운 카드로 직접 스냅시켜준다.
      if (stepRef.current) {
        const index = Math.round(
          (container.scrollLeft +
            centerOffsetRef.current -
            firstOffsetRef.current) /
            stepRef.current,
        );
        const targetLeft = Math.max(
          0,
          Math.min(
            firstOffsetRef.current +
              index * stepRef.current -
              centerOffsetRef.current,
            container.scrollWidth - container.clientWidth,
          ),
        );
        container.scrollTo({ left: targetLeft, behavior: 'smooth' });
      }
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
        className="no-scrollbar -mx-5 flex cursor-grab snap-x snap-mandatory gap-2 overflow-x-auto px-5 active:cursor-grabbing"
      >
        {items.map((item, index) => (
          <RoomCard
            key={item.type === 'fill' ? `fill-${item.id}` : `empty-${index}`}
            {...item}
            className="snap-center"
          />
        ))}
      </div>
      {/* 모바일 웹뷰에서는 dot 하나의 탭 영역이 너무 작아 눌리는 게 안정적이지 않아서,
          클릭 가능한 버튼이 아니라 순수 인디케이터로만 둔다(onDotClick 미전달). */}
      {items.length > 1 && (
        <Pagination
          className="justify-center"
          total={items.length}
          current={current}
        />
      )}
    </div>
  );
}

export default RoomCardCarousel;
