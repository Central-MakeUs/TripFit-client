'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import ArrowDownIcon from '@/assets/icons/arrow-down-200.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right-200.svg';
import Button from '@/components/button';
import RoomCardCarousel from '@/components/room-card-carousel';
import { RoomCardProps } from '@/components/room-card';
import RoomListItem from '@/components/room-list-item';
import TextButton from '@/components/text-button';
import { cn } from '@/utils/cn';

import {
  ALL_ROOMS,
  ONGOING_ROOM_CARDS,
  RoomFilterT,
} from '../_consts/room.const';
import RoomFilterBottomSheet from './RoomFilterBottomSheet';

// 진행 중인 여행이 이 개수 미만일 때만 캐러셀 끝에 "여행방 신규 생성하기" 카드를 노출한다.
const MIN_ONGOING_ROOMS_FOR_HIDDEN_EMPTY_CARD = 3;

function HomeSections() {
  const router = useRouter();
  const [filter, setFilter] = useState<RoomFilterT>('all');
  const [onlyMine, setOnlyMine] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // 고정(pin) 아이콘의 즉시 시각 반영용 로컬 상태 — 실제 노출 순서는 서버 응답
  // 기준이라 API 연동 전까지는 클릭해도 재정렬되지 않고, 새로고침(재요청)해야 반영된다.
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(
    () =>
      new Set(
        ONGOING_ROOM_CARDS.flatMap((card) =>
          card.type === 'fill' && card.isPinned ? [card.id] : [],
        ),
      ),
  );
  // 페이지 전체가 스크롤되는 구조라, "리스트 아래로 더 볼 게 남았는지"는
  // 리스트 끝에 심어둔 sentinel이 뷰포트에 들어왔는지로 판단한다.
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  const togglePinned = (id: number) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 노출 우선순위(서버 기준 고정값): 1) 고정 여부 → 2) 최근 활동순.
  const sortedOngoingRooms = ONGOING_ROOM_CARDS.filter(
    (card) => card.type === 'fill',
  ).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return (
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
    );
  });

  const carouselItems: RoomCardProps[] = [
    ...sortedOngoingRooms.map((card) => ({
      ...card,
      isPinned: pinnedIds.has(card.id),
      onClick: () => router.push(`/room/${card.id}`),
      onPin: () => togglePinned(card.id),
    })),
    ...(sortedOngoingRooms.length < MIN_ONGOING_ROOMS_FOR_HIDDEN_EMPTY_CARD
      ? [
          {
            type: 'empty' as const,
            onClick: () => router.push('/room/new'),
          },
        ]
      : []),
  ];

  const filteredRooms = ALL_ROOMS.filter(
    (room) =>
      (filter === 'all' || room.filter === filter) &&
      (!onlyMine || room.isHost),
  ).sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime(),
  );

  const hasAnyRoom = sortedOngoingRooms.length > 0 || ALL_ROOMS.length > 0;

  useEffect(() => {
    const target = listEndRef.current;
    if (!target || !hasAnyRoom) return;
    // sentinel이 화면에 아직 안 보이면(intersecting=false) 리스트가 뷰포트 아래로
    // 더 남아있다는 뜻이므로 페이드를 보여준다.
    // rootMargin으로 여백을 주면 실제 하단 padding 값에 따라 "완전히 끝까지
    // 스크롤해도 안 사라지는" 오차가 생기기 쉬워서, 대신 상태 업데이트를 짧게
    // 디바운스해 경계에서의 빠른 토글(깜빡임)만 걸러낸다.
    let debounceId: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(([entry]) => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        setHasMoreBelow(entry ? !entry.isIntersecting : false);
      }, 50);
    });
    observer.observe(target);
    return () => {
      clearTimeout(debounceId);
      observer.disconnect();
    };
  }, [filteredRooms.length, hasAnyRoom]);

  return (
    <>
      <section className="flex w-full flex-col gap-4">
        <h2 className="text-headline-03 text-black">진행 중인 여행</h2>
        <RoomCardCarousel items={carouselItems} />
      </section>

      <section className="flex w-full flex-1 flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-headline-03 text-black">전체 여행 보기</h2>
          <TextButton
            text="전체 보기"
            onClick={() => setIsFilterOpen(true)}
            icon={<ArrowDownIcon className="size-4" />}
          />
        </div>

        {hasAnyRoom ? (
          <>
            <div className="flex w-full flex-col gap-[11px]">
              {filteredRooms.map((room) => (
                <RoomListItem
                  key={room.id}
                  title={room.title}
                  dateRange={room.dateRange}
                  isHost={room.isHost}
                  statusTag={room.statusTag}
                  statusTagType={room.statusTagType}
                  onClick={() => router.push(`/room/${room.id}`)}
                />
              ))}
            </div>
            <div ref={listEndRef} aria-hidden className="h-px w-full" />
          </>
        ) : (
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 py-10">
            {/* TODO: 디자인 확정되면 실제 일러스트로 교체 (Figma 463-40924엔 빈 사각형 placeholder만 있음) */}
            <div className="size-20 shrink-0 bg-grey-100" />
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center text-center">
                <p className="text-body-03 text-black">
                  앗! 아직 등록된 여행이 없어요
                </p>
                <p className="text-caption-02 text-grey-400">
                  여행을 추가하고
                  <br />
                  최적의 여행 일정을 추천받으세요.
                </p>
              </div>
              <Button
                text="TripFit 가이드 보기"
                style="weak"
                type="primary"
                size="M"
                icon={<ArrowRightIcon />}
                iconPosition="right"
                onClick={() => router.push('/guide')}
                className="h-11 gap-0.5 py-2.5 pr-3 pl-4"
              />
            </div>
          </div>
        )}
      </section>

      {hasAnyRoom && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto h-20 w-full bg-linear-to-b from-white/0 to-white/40 backdrop-blur-[1px] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black)] [mask-image:linear-gradient(to_bottom,transparent,black)] transition-opacity duration-300 sm:max-w-90',
            hasMoreBelow ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      <RoomFilterBottomSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filter={filter}
        onFilterChange={setFilter}
        onlyMine={onlyMine}
        onOnlyMineChange={setOnlyMine}
      />
    </>
  );
}

export default HomeSections;
