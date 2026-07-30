'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import ArrowDownIcon from '@/assets/icons/arrow-down-200.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right-200.svg';
import emptyTripsSuitcase from '@/assets/images/empty-trips-suitcase.png';
import Button from '@/components/button';
import RoomCardCarousel from '@/components/room-card-carousel';
import { RoomCardProps } from '@/components/room-card';
import RoomListItem from '@/components/room-list-item';
import Spinner from '@/components/spinner';
import TextButton from '@/components/text-button';
import { cn } from '@/utils/cn';

import { useGetTrips } from '../_hooks/useGetTrips';
import { usePatchTripPin } from '../_hooks/usePatchTripPin';
import {
  getTripDateRange,
  getTripStatusTag,
  truncateTripTitle,
} from '../_utils/mapTripHomeCard';
import { RoomFilterT } from '../_consts/room.const';
import RoomFilterBottomSheet from './RoomFilterBottomSheet';

// 진행 중인 여행이 이 개수 미만일 때만 캐러셀 끝에 "여행방 신규 생성하기" 카드를 노출한다.
const MIN_ONGOING_ROOMS_FOR_HIDDEN_EMPTY_CARD = 3;

function HomeSections() {
  const router = useRouter();
  const [filter, setFilter] = useState<RoomFilterT>('all');
  const [onlyMine, setOnlyMine] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // 페이지 전체가 스크롤되는 구조라, "리스트 아래로 더 볼 게 남았는지"는
  // 리스트 끝에 심어둔 sentinel이 뷰포트에 들어왔는지로 판단한다.
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  const { tripsData: ongoingTrips, isTripsLoading: isOngoingTripsLoading } =
    useGetTrips({ scope: 'ongoing' });
  const { tripsData: allTrips, isTripsLoading: isAllTripsLoading } =
    useGetTrips({ scope: 'all' });
  const { patchTripPinMutation } = usePatchTripPin();

  // 핀 토글은 pinned 값만 낙관적으로 바꿔 아이콘 색만 즉시 반영하고, 순서 재배치는
  // 의도적으로 하지 않는다 — 새로고침 시 백엔드가 pinned 순으로 내려주는 응답을
  // 받아야 정렬되도록 둔다.
  const sortedOngoingRooms = ongoingTrips ?? [];
  // 필터(상태/내가 생성한 방만)는 서버 재요청 없이 이미 받아온 전체 목록을
  // 클라이언트에서 그때그때 걸러서 보여준다 — 필터가 바뀔 때마다 새로 fetch할
  // 필요가 없다.
  const filteredRooms = (allTrips ?? []).filter((trip) => {
    if (trip.status === 'EXPIRED') return false;
    if (onlyMine && trip.myRole !== 'OWNER') return false;
    if (filter === 'ongoing') return trip.status === 'ONGOING';
    if (filter === 'confirmed') return trip.status === 'CONFIRMED';
    return true;
  });

  const carouselItems: RoomCardProps[] = [
    ...sortedOngoingRooms.map((trip) => ({
      type: 'fill' as const,
      id: trip.tripId,
      title: truncateTripTitle(trip.name),
      isHost: trip.myRole === 'OWNER',
      isPinned: trip.pinned,
      statusTag: getTripStatusTag(trip)?.text,
      nights: trip.durationNights,
      days: trip.durationDays,
      dateRange: getTripDateRange(trip),
      membersPreview: trip.membersPreview,
      membersPreviewOverflow: trip.membersPreviewOverflow,
      capacity: trip.memberCount,
      respondedCount: trip.activeMemberCount,
      progress: trip.memberFillRate * 100,
      lastActivityAt: trip.lastActivityAt,
      onClick: () => router.push(`/room/${trip.tripId}`),
      onPin: () =>
        patchTripPinMutation({
          tripId: trip.tripId,
          pinned: !trip.pinned,
        }),
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

  const hasAnyRoom = sortedOngoingRooms.length > 0 || filteredRooms.length > 0;

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

  if (isOngoingTripsLoading || isAllTripsLoading) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

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
              {filteredRooms.map((trip) => (
                <RoomListItem
                  key={trip.tripId}
                  title={trip.name}
                  dateRange={getTripDateRange(trip)}
                  isHost={trip.myRole === 'OWNER'}
                  statusTag={getTripStatusTag(trip)?.text}
                  statusTagType={getTripStatusTag(trip)?.type}
                  onClick={() => router.push(`/room/${trip.tripId}`)}
                />
              ))}
            </div>
            <div ref={listEndRef} aria-hidden className="h-px w-full" />
          </>
        ) : (
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 py-10">
            <Image
              src={emptyTripsSuitcase}
              alt=""
              width={120}
              height={120}
              className="shrink-0"
            />
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
