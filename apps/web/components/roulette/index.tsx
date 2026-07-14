'use client';

import {
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/utils/cn';

import { rouletteItemOpacity } from './roulette.style';

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

const FRICTION = 0.92;
const MAX_VELOCITY = 3;
const MIN_VELOCITY = 0.02;
const SNAP_EASE = 0.25;
const WHEEL_SETTLE_DELAY = 120;

// 실린더 표면에 숫자가 붙어있는 것처럼 보이도록, scaleY로 눌러 흉내내는 대신
// 진짜 3D 회전(rotateX)+원근(perspective)을 쓴다. 각 칸을 중심 축 기준으로
// ANGLE_PER_ITEM°씩 돌려 반지름 RADIUS만큼 뒤로 밀어두면, 위치(간격이 중심에서
// 멀어질수록 좁아짐)와 크기 압축이 둘 다 이 회전에서 자연히 나온다 — 폰트 크기를
// 억지로 크게 벌리지 않아도 원근 자체가 "중심이 더 크게" 보이게 만든다.
const ANGLE_PER_ITEM = 33;
const RADIUS = 100;
const PERSPECTIVE = 600;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// 네이티브 스크롤(overflow-y-auto + scroll-snap)에 기대면, 브라우저가 계산하는
// "어디서 멈췄는지"와 우리가 그리는 시각적 위치가 서로 다른 좌표계라서 둘이 어긋나는
// 순간(특히 스냅 애니메이션 도중) 버벅임이 생긴다. 그래서 네이티브 스크롤을 아예 쓰지
// 않고, 포인터 입력으로 offset(현재 중앙에 있는 인덱스, 소수 가능)을 직접 계산해
// 관성/스냅까지 우리가 애니메이션한다. 값의 "위치"가 항상 단일 소스(offset)에서만
// 나오므로 시각적 위치와 실제 위치가 어긋날 여지가 없다.
function Roulette({
  centerFontSize = 64,
  className,
  fontSize = 38,
  itemHeight = 62,
  onChange,
  value,
  values,
  visibleCount = 5,
}: RouletteProps) {
  const maxIndex = values.length - 1;
  const paddingCount = Math.floor(visibleCount / 2);
  const maxAngleRad = (paddingCount * ANGLE_PER_ITEM * Math.PI) / 180;
  const viewportHeight = RADIUS * Math.sin(maxAngleRad) * 2 + itemHeight;

  const offsetRef = useRef(clamp(values.indexOf(value), 0, maxIndex));
  const [offset, setOffset] = useState(offsetRef.current);

  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dragRef = useRef<{ lastY: number; lastTime: number } | null>(null);

  const stopAnimation = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const commitValue = (index: number) => {
    const nextValue = values[index];
    if (nextValue !== undefined && nextValue !== value) {
      onChange(nextValue);
    }
  };

  const runSnapAnimation = () => {
    stopAnimation();
    const step = () => {
      const target = clamp(Math.round(offsetRef.current), 0, maxIndex);
      const diff = target - offsetRef.current;
      if (Math.abs(diff) < 0.001) {
        offsetRef.current = target;
        setOffset(target);
        rafRef.current = null;
        commitValue(target);
        return;
      }
      offsetRef.current += diff * SNAP_EASE;
      setOffset(offsetRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const runMomentumAnimation = () => {
    stopAnimation();
    const step = () => {
      velocityRef.current *= FRICTION;
      const next = offsetRef.current + velocityRef.current;
      if (
        next < 0 ||
        next > maxIndex ||
        Math.abs(velocityRef.current) < MIN_VELOCITY
      ) {
        offsetRef.current = clamp(next, 0, maxIndex);
        setOffset(offsetRef.current);
        runSnapAnimation();
        return;
      }
      offsetRef.current = next;
      setOffset(next);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  // value가 우리 자신의 onChange로 인한 게 아니라 외부에서 바뀐 경우에만 즉시 이동한다.
  useEffect(() => {
    const index = values.indexOf(value);
    if (index === -1 || Math.abs(offsetRef.current - index) < 0.001) return;
    stopAnimation();
    offsetRef.current = index;
    setOffset(index);
  }, [value, values]);

  useEffect(() => {
    return () => {
      stopAnimation();
      clearTimeout(wheelTimeoutRef.current);
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    stopAnimation();
    velocityRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { lastY: event.clientY, lastTime: performance.now() };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const now = performance.now();
    const deltaY = event.clientY - drag.lastY;
    const dt = Math.max(now - drag.lastTime, 1);
    const deltaOffset = -deltaY / itemHeight;
    offsetRef.current = clamp(offsetRef.current + deltaOffset, 0, maxIndex);
    setOffset(offsetRef.current);
    velocityRef.current = clamp(
      (deltaOffset / dt) * 16.67,
      -MAX_VELOCITY,
      MAX_VELOCITY,
    );
    drag.lastY = event.clientY;
    drag.lastTime = now;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
      runMomentumAnimation();
    } else {
      runSnapAnimation();
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    stopAnimation();
    velocityRef.current = 0;
    const deltaOffset = event.deltaY / itemHeight / 3;
    offsetRef.current = clamp(offsetRef.current + deltaOffset, 0, maxIndex);
    setOffset(offsetRef.current);
    clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(runSnapAnimation, WHEEL_SETTLE_DELAY);
  };

  return (
    <div
      className={cn(
        'relative w-full touch-none cursor-grab overflow-hidden select-none active:cursor-grabbing',
        className,
      )}
      style={{ height: viewportHeight, perspective: PERSPECTIVE }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {values.map((item, index) => {
        const signedDistance = index - offset;
        const distance = Math.abs(signedDistance);
        // fontSize를 프레임마다 바꾸면 매번 레이아웃(reflow)이 다시 계산돼 버벅임의
        // 원인이 된다. fontSize는 centerFontSize로 고정해두고, 중심 칸만 살짝 더 커
        // 보이게 하는 정도는 transform(scale)로만 표현한다 — 크기 차이의 대부분은
        // 아래 3D 회전(rotateX)에서 자연히 나오므로 이 보정은 아주 작게만 준다.
        const emphasisScale =
          (fontSize + (centerFontSize - fontSize) * Math.max(1 - distance, 0)) /
          centerFontSize;
        return (
          <div
            key={item}
            className="pointer-events-none absolute inset-x-0 flex items-center justify-center font-semibold"
            style={{
              top: '50%',
              height: itemHeight,
              marginTop: -itemHeight / 2,
              fontSize: centerFontSize,
              color: `rgba(0, 0, 0, ${rouletteItemOpacity(distance)})`,
              transform: `rotateX(${-signedDistance * ANGLE_PER_ITEM}deg) translateZ(${RADIUS}px) scale(${emphasisScale})`,
            }}
          >
            {item}
          </div>
        );
      })}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-white/70 to-white/0"
        style={{ height: itemHeight }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-white/70 to-white/0"
        style={{ height: itemHeight }}
      />
    </div>
  );
}

export default Roulette;
