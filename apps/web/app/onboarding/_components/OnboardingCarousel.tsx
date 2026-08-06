'use client';

import { type PointerEvent, useEffect, useRef, useState } from 'react';

import Pagination from '@/components/pagination';

import { ONBOARDING_SLIDES } from '../_consts/onboarding.const';
import OnboardingSlide from './OnboardingSlide';

const DRAG_THRESHOLD = 5;

function OnboardingCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<{
    isDragging: boolean;
    pointerId: number;
    startScrollLeft: number;
    startX: number;
  } | null>(null);
  const [current, setCurrent] = useState(0);

  // 각 슬라이드가 컨테이너 전체 너비를 그대로 차지해서(w-full shrink-0), 뷰포트 정중앙을
  // 지나는 슬라이드를 관찰하면 어떤 입력 수단으로 스크롤되든 최종적으로 화면에 온 슬라이드를
  // 그대로 읽을 수 있다 — scrollLeft를 너비로 나눠 역산하는 방식보다 어긋날 여지가 없다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
          const index = slideRefs.current.indexOf(
            entry.target as HTMLDivElement,
          );
          if (index === -1) return;
          latestIndex = index;
          if (rafId === null) rafId = requestAnimationFrame(flush);
        });
      },
      { root: container, rootMargin: '0px -49% 0px -49%', threshold: 0 },
    );

    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // 마우스는 스크롤 컨테이너를 드래그해도 네이티브 스크롤이 발생하지 않아 직접 따라가게
  // 해준다(데스크톱 브라우저에서 테스트할 때 필요) — 터치는 네이티브 스크롤을 그대로 쓴다.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    // 오른쪽/보조 버튼(컨텍스트 메뉴 등)까지 드래그로 취급하면 안 된다 — 기본
    // 왼쪽 버튼(button === 0)만 캐러셀 드래그로 처리한다.
    if (!container || event.pointerType !== 'mouse' || event.button !== 0)
      return;
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
      container.style.scrollBehavior = '';

      const restoreSnap = () => {
        container.style.scrollSnapType = '';
      };

      const step = container.clientWidth;
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
    <div className="flex w-full flex-col py-5">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="no-scrollbar flex w-full cursor-grab snap-x snap-mandatory overflow-x-auto active:cursor-grabbing"
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <div
            key={slide.title}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className="w-full min-w-0 shrink-0 snap-center"
          >
            <OnboardingSlide {...slide} priority={index === 0} />
          </div>
        ))}
      </div>
      <Pagination
        className="justify-center mt-4"
        total={ONBOARDING_SLIDES.length}
        current={current}
      />
    </div>
  );
}

export default OnboardingCarousel;
