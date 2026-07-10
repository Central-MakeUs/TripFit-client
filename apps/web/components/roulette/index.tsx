'use client';

import { type PointerEvent, useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

import { rouletteItemOpacity, rouletteItemScale } from './roulette.style';

type RouletteProps = {
  centerFontSize?: number;
  className?: string;
  fontSize?: number;
  itemHeight?: number;
  onChange: (value: string) => void;
  value: string;
  values: string[];
  visibleCount?: number;
};

function Roulette({
  centerFontSize = 32,
  className,
  fontSize = 24,
  itemHeight = 44,
  onChange,
  value,
  values,
  visibleCount = 5,
}: RouletteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const isSyncingRef = useRef(false);
  const dragRef = useRef<{ startScrollTop: number; startY: number } | null>(
    null,
  );
  const [centerOffset, setCenterOffset] = useState(() =>
    Math.max(values.indexOf(value), 0),
  );
  const paddingCount = Math.floor(visibleCount / 2);

  useEffect(() => {
    const container = containerRef.current;
    const index = values.indexOf(value);
    if (!container || index === -1) return;
    isSyncingRef.current = true;
    container.scrollTo({ top: index * itemHeight, behavior: 'auto' });
    setCenterOffset(index);
    const id = requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [value, values, itemHeight]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || isSyncingRef.current) return;
    const rawOffset = container.scrollTop / itemHeight;
    setCenterOffset(rawOffset);

    const index = Math.round(rawOffset);
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const nextValue = values[Math.min(Math.max(index, 0), values.length - 1)];
      if (nextValue !== undefined && nextValue !== value) {
        onChange(nextValue);
      }
    }, 120);
  };

  // 마우스는 스크롤 컨테이너를 드래그해도 네이티브 스크롤이 발생하지 않으므로 직접 따라가게 해준다.
  // 터치는 네이티브 스크롤(관성 포함)이 이미 동작하므로 건드리지 않는다.
  // 드래그 중에는 scroll-snap이 매 프레임 가장 가까운 항목으로 되돌리려고 해서 움직임을 상쇄시키므로 잠시 꺼둔다.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || event.pointerType !== 'mouse') return;
    dragRef.current = {
      startScrollTop: container.scrollTop,
      startY: event.clientY,
    };
    container.setPointerCapture(event.pointerId);
    container.style.scrollSnapType = 'none';
    container.style.scrollBehavior = 'auto';
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const drag = dragRef.current;
    if (!container || !drag || event.pointerType !== 'mouse') return;
    container.scrollTop = drag.startScrollTop - (event.clientY - drag.startY);
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
    <div
      className={cn('relative', className)}
      style={{ height: itemHeight * visibleCount }}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="no-scrollbar h-full cursor-grab snap-y snap-mandatory overflow-y-auto scroll-smooth active:cursor-grabbing"
      >
        <div style={{ height: itemHeight * paddingCount }} />
        {values.map((item, index) => {
          const distance = Math.abs(index - centerOffset);
          return (
            <div
              key={item}
              className="flex snap-center items-center justify-center font-semibold"
              style={{
                height: itemHeight,
                fontSize:
                  fontSize +
                  (centerFontSize - fontSize) * Math.max(1 - distance, 0),
                color: `rgba(0, 0, 0, ${rouletteItemOpacity(distance)})`,
                transform: `scaleY(${rouletteItemScale(distance)})`,
              }}
            >
              {item}
            </div>
          );
        })}
        <div style={{ height: itemHeight * paddingCount }} />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-white/70 to-white/0"
        style={{ height: itemHeight }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/70 to-white/0"
        style={{ height: itemHeight }}
      />
    </div>
  );
}

export default Roulette;
