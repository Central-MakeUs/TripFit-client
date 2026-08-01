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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  // scrollLeft를 step으로 나눠 인덱스를 역산하는 방식은 마우스 드래그, 트랙패드,
  // 터치 등 입력 수단마다 스냅 타이밍이 달라서 어떤 경로로는 어긋날 여지가 있다.
  // 대신 뷰포트 정중앙을 지나는 카드가 어떤 카드인지 IntersectionObserver로 직접
  // 관찰한다 — 어떤 방식으로 스크롤되든 최종적으로 중앙에 온 카드를 그대로 읽으므로
  // 계산이 어긋날 여지가 없다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 드래그로 여러 카드를 빠르게 스쳐 지나가면 중앙 영역을 짧은 시간에 여러 번
    // 넘나들면서 콜백이 연속으로 여러 번 불릴 수 있다. 매번 바로 setState하면
    // 드래그 중 리렌더가 겹쳐 버벅이므로, 프레임당 한 번만 최신 값을 커밋한다.
    let rafId: number | null = null;
    let latestIndex: number | null = null;

    const flush = () => {
      rafId = null;
      if (latestIndex !== null) setCurrent(latestIndex);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = cardRefs.current.indexOf(
            entry.target as HTMLDivElement,
          );
          if (index === -1) return;
          latestIndex = index;
          if (rafId === null) rafId = requestAnimationFrame(flush);
        });
      },
      { root: container, rootMargin: '0px -49% 0px -49%', threshold: 0 },
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [items.length]);

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

    // 드래그는 손가락/마우스를 실시간으로 따라가야 자연스럽게 느껴지므로
    // rAF로 지연시키지 않고 바로 반영한다(지연시키면 오히려 한 프레임씩
    // 밀리는 버벅임으로 느껴진다).
    container.scrollLeft = drag.startScrollLeft - delta;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const drag = dragRef.current;
    if (container && drag?.isDragging && event.pointerType === 'mouse') {
      container.releasePointerCapture(drag.pointerId);
      container.style.scrollBehavior = '';

      // scrollLeft를 코드로 직접 움직인 드래그라 브라우저가 "스크롤이 끝났다"는
      // 네이티브 제스처로 인식하지 못해 scroll-snap이 알아서 스냅해주지 않는다.
      // 놓인 위치에서 가장 가까운 카드로 직접 스냅시켜준다.
      const restoreSnap = () => {
        container.style.scrollSnapType = '';
      };

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
        // scroll-snap을 애니메이션 도중에 바로 복원하면, 아직 스냅되지 않은
        // 전환 중인 위치에서 브라우저 자체 snap 로직이 또 개입해 scrollTo
        // 애니메이션과 충돌한다 — 목표 카드까지 못 가고 중간에 멈추는 원인이라
        // 애니메이션이 끝난 뒤에만 복원한다.
        // 이미 목표 위치라 scrollTo가 실제로 스크롤을 안 시키는 경우(놓은 지점이
        // 스냅 지점과 같을 때) scroll 이벤트 자체가 안 생겨 scrollend가 영영
        // 안 뜬다 — 그러면 scroll-snap-type: none이 인라인로 계속 남아버려서
        // 그 뒤로는 스냅이 아예 동작하지 않게 되므로, 이동이 없을 땐 바로 복원한다.
        if (Math.round(container.scrollLeft) === Math.round(targetLeft)) {
          restoreSnap();
        } else if ('onscrollend' in container) {
          container.addEventListener('scrollend', restoreSnap, {
            once: true,
          });
        } else {
          setTimeout(restoreSnap, 400);
        }
        container.scrollTo({ left: targetLeft, behavior: 'smooth' });
      } else {
        restoreSnap();
      }
    }
    dragRef.current = null;
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="no-scrollbar -mx-5 flex cursor-grab snap-x snap-mandatory gap-2 overflow-x-auto px-5 active:cursor-grabbing"
      >
        {items.map((item, index) => (
          <div
            key={item.type === 'fill' ? `fill-${item.id}` : `empty-${index}`}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="w-full shrink-0 snap-center"
          >
            <RoomCard {...item} />
          </div>
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
