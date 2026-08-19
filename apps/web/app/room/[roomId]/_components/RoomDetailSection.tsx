'use client';

import { useEffect, useState } from 'react';
import { addYears, format, max, parseISO, subDays } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

import { ApiError } from '@/apis/request';
import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import {
  BasicInfoScreen,
  BasicInfoValue,
  DEFAULT_BASIC_INFO_VALUE,
} from '@/components/basic-info/basicInfo.const';
import Header from '@/components/header';
import Spinner from '@/components/spinner';
import { useDeleteAllRegularSchedules } from '@/hooks/useDeleteAllRegularSchedules';
import { useGetScheduleCalendar } from '@/hooks/useGetScheduleCalendar';
import { useGetTrips } from '@/hooks/useGetTrips';
import { usePatchPersonalSchedule } from '@/hooks/usePatchPersonalSchedule';
import { useRefreshScheduleStatus } from '@/hooks/useRefreshScheduleStatus';
import { useSaveRegularSchedule } from '@/hooks/useSaveRegularSchedule';
import { useSaveVacationPolicy } from '@/hooks/useSaveVacationPolicy';
import { useAuthStore } from '@/stores/authStore';
import { IndividualScheduleValueT } from '@/types/schedule';
import { RoomMemberStatusT } from '@/types/room';
import { mapRegularScheduleItemToClient } from '@/utils/mapRegularSchedule';
import { mapScheduleCalendarToIndividualScheduleValue } from '@/utils/mapScheduleCalendar';
import { mapVacationPolicyToClient } from '@/utils/mapVacationPolicy';

import ConfirmScheduleModal from '../../_common/_components/ConfirmScheduleModal';
import PreScheduleRequiredModal from '../../_common/_components/PreScheduleRequiredModal';
import ShareSheet from '../../_common/_components/ShareSheet';
import { SCHEDULE_REQUEST_SHARE_DESCRIPTION } from '../../_common/_consts/shareMessages';
import { useScheduleConfirmGate } from '../../_common/_hooks/useScheduleConfirmGate';
import { useGetRoomMembers } from '../_common/_hooks/useGetRoomMembers';
import { useGetRoom } from '../../_common/_hooks/useGetRoom';
import { usePostTripsJoin } from '../_common/_hooks/usePostTripsJoin';
import GroupCalendarSection from './group-calendar/GroupCalendarSection';
import RecommendationSection from './recommendation/RecommendationSection';

type RoomDetailSectionProps = {
  roomId: string;
};

type SectionT = 'calendar' | 'recommendation';

function RoomDetailSection({ roomId }: RoomDetailSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 초대 링크(카카오톡 공유 등)에 화면 노출 없이 실어 보낸 초대 코드 — 초대
  // 받은 사람이 아직 이 방 멤버가 아닐 때만 참여 처리에 쓰인다.
  const inviteCode = searchParams.get('inviteCode');
  const [section, setSection] = useState<SectionT>('calendar');
  const [isRequestResponseOpen, setIsRequestResponseOpen] = useState(false);
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const [basicInfoInitialScreen, setBasicInfoInitialScreen] =
    useState<BasicInfoScreen>('hasRegularSchedule');
  const [scheduleErrorMessage, setScheduleErrorMessage] = useState<
    string | null
  >(null);
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);

  // 사전 일정(정기+연차·휴일 정보) 입력을 마쳤는지는 hasCompletedPreSchedule
  // 하나로만 판단한다 — 정기·개별 일정 건수 조합으로 판단하면 개별 일정만 등록한
  // 사용자가 정기 일정 확인/입력 모달을 잘못 보는 문제(QA 이슈)가 생긴다.
  const hasCompletedPreSchedule = useAuthStore(
    (state) => state.hasCompletedPreSchedule,
  );

  // hasCompletedPreSchedule는 persist된 store 값이라, 하이드레이션이 끝나기 전엔 이미
  // 사전 일정을 입력한 사용자도 잠깐 기본값(false)으로 보인다 — 그 사이 아래
  // 판단이 잘못될 수 있으므로 하이드레이션 완료 여부를 별도로 추적한다.
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  // 방/멤버 조회(ACTIVE 전용 API)와 무관하게 항상 내려오는 내 트립 목록에서
  // myRole·myMemberStatus를 얻는다 — SCHEDULE_PENDING(activate 전) 상태에서도
  // 방장·참여자 여부와 일정 확인 완료 여부를 이걸로 먼저 판단할 수 있다.
  const { tripsData, isTripsLoading, refetchTrips } = useGetTrips({
    scope: 'all',
  });
  const currentTrip = tripsData?.find((trip) => trip.tripId === roomId);
  const isHost = currentTrip?.myRole === 'OWNER';
  const tripMinDate = currentTrip
    ? parseISO(currentTrip.startRange)
    : undefined;
  const tripMaxDate = currentTrip ? parseISO(currentTrip.endRange) : undefined;

  // join(POST /trips/join) 성공·activate(POST /trips/{roomId}/activate) 성공
  // 직후엔 트립 목록이 아직 그 결과를 반영하지 못했으므로, 그 사이엔 이 값으로
  // currentTrip의 myMemberStatus를 덮어써 화면 분기가 즉시 따라오게 한다.
  const [memberStatusOverride, setMemberStatusOverride] =
    useState<RoomMemberStatusT | null>(null);
  const myMemberStatus = memberStatusOverride ?? currentTrip?.myMemberStatus;

  // 트립 목록에 이 방이 없으면(초대 링크로 처음 들어와 아직 멤버가 아닌 경우)
  // join을 먼저 시도해 멤버십을 만든다 — 이미 멤버인 사람이 링크를 다시 열어도
  // 멱등이라 안전하지만, 트립 목록에서 이미 확인되면 굳이 다시 부르지 않는다.
  const { postTripsJoinMutation, isPostTripsJoinPending } = usePostTripsJoin();
  const needsJoin =
    hasHydrated &&
    !isTripsLoading &&
    !!inviteCode &&
    !currentTrip &&
    memberStatusOverride === null &&
    joinErrorMessage === null;

  const handleDismissJoinError = () => {
    setJoinErrorMessage(null);
    router.push('/');
  };

  useEffect(() => {
    if (!needsJoin) return;
    postTripsJoinMutation({ inviteCode: inviteCode! })
      .then((data) => {
        setMemberStatusOverride(data.myMemberStatus);
        refetchTrips();
      })
      .catch((error) => {
        setJoinErrorMessage(
          error instanceof Error ? error.message : '참여하지 못했어요.',
        );
      });
    // postTripsJoinMutation은 매 렌더마다 새로 만들어지는 클로저라 의존성에 넣으면
    // needsJoin이 안 바뀌어도 재실행된다 — 이 값이 바뀔 때만(참여 시도가
    // 필요해졌을 때만) 한 번 실행하면 되므로 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsJoin]);

  const needsScheduleEntry = myMemberStatus === 'SCHEDULE_PENDING';
  // ACTIVE로 확인됐거나(myMemberStatus), 애초에 이 방 멤버가 아닌 것으로 보이는
  // 경우(초대 코드 없이 잘못된 접근 등)엔 실제 API 응답(403 TRIP_ACCESS_DENIED
  // 등)으로 에러 처리하도록 그대로 조회를 켠다 — join 시도 중이거나, join이
  // 실패했거나, 트립 목록이 아직 안 와서 myMemberStatus를 모르는 동안
  // (!isTripsLoading 전)엔 꺼둔다 — 그렇지 않으면 join 실패 시에도(needsJoin이
  // joinErrorMessage 때문에 false로 빠지므로) 이 방 멤버가 아닌 것처럼 조회가
  // 나가버린다.
  const enableRoomQueries =
    hasHydrated &&
    !isTripsLoading &&
    !needsJoin &&
    !needsScheduleEntry &&
    joinErrorMessage === null;

  const { roomData, isGetRoomLoading, isGetRoomError, refetchRoom } =
    useGetRoom(roomId, { enabled: enableRoomQueries });
  const {
    roomMembersData,
    isGetRoomMembersLoading,
    isGetRoomMembersError,
    refetchRoomMembers,
  } = useGetRoomMembers(roomId, { enabled: enableRoomQueries });
  const { confirmSchedule, confirmErrorModal } = useScheduleConfirmGate();

  // hasCompletedPreSchedule(연차·휴일 정보 저장 여부)로 게이팅하지 않는다 —
  // 정기 일정만 저장해두고 연차·휴일 정보는 아직 저장 안 한(마이페이지에서
  // 중간에 나간 등) 사용자는 hasCompletedPreSchedule이 false여도 정기 일정
  // 데이터가 실제로 존재할 수 있다. "정기 일정이 있나요?"에서 "네"를 골라도
  // 그 데이터를 그대로 보여줘야 하므로 항상 조회한다.
  const {
    regularSchedulesData,
    isRegularSchedulesLoading,
    addRegularSchedule,
    editRegularSchedule,
    removeRegularSchedule,
  } = useSaveRegularSchedule();
  const { deleteAllRegularSchedulesMutation } = useDeleteAllRegularSchedules();
  const { vacationPolicyData, isVacationPolicyLoading, saveVacationPolicy } =
    useSaveVacationPolicy();
  const { refreshScheduleStatus } = useRefreshScheduleStatus();

  const handleSaveVacationPolicy = async (value: BasicInfoValue) => {
    try {
      await saveVacationPolicy(value);
      await refreshScheduleStatus();
      return true;
    } catch (error) {
      setScheduleErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
  };

  const handleRegularScheduleError = (message: string) => {
    setScheduleErrorMessage(message);
  };

  const today = new Date();
  // 여행 예상 기간이 이미 시작된 뒤(tripMinDate가 과거)라도, 개인 일정 조회 API는
  // 오늘 이전 날짜를 시작일로 받지 않으므로 오늘보다 앞서지 않게 clamp한다.
  const { refetchScheduleCalendar } = useGetScheduleCalendar({
    startDate: format(
      tripMinDate ? max([today, tripMinDate]) : today,
      'yyyy-MM-dd',
    ),
    endDate: format(
      tripMaxDate ?? subDays(addYears(today, 2), 1),
      'yyyy-MM-dd',
    ),
  });

  const handleBeforeIndividualSchedule = async () => {
    const { data } = await refetchScheduleCalendar();
    if (!data) return undefined;
    return mapScheduleCalendarToIndividualScheduleValue(data.days);
  };

  const { patchPersonalScheduleMutation } = usePatchPersonalSchedule();

  const handleSaveIndividualSchedule = async (
    value: BasicInfoValue,
    individualScheduleBackdrop: IndividualScheduleValueT,
  ) => {
    try {
      if (Object.keys(value.individualSchedule).length > 0) {
        await patchPersonalScheduleMutation({
          value: value.individualSchedule,
          mergedStatus: individualScheduleBackdrop,
        });
        await refreshScheduleStatus();
      }
    } catch (error) {
      setScheduleErrorMessage(
        error instanceof ApiError && error.code === 'INVALID_INPUT'
          ? '저장 가능한 기간을 벗어났어요.'
          : error instanceof Error
            ? error.message
            : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
    // activate는 방장·참여자 모두 동일하게 호출한다 — join(참여자) 또는
    // create(방장)로 SCHEDULE_PENDING 멤버가 된 뒤, 일정 확인을 마치면 이 호출로
    // ACTIVE가 되어야 방 상세에 들어갈 수 있다.
    return confirmSchedule(roomId);
  };

  // 사전 일정 입력을 이미 마쳤으면(hasCompletedPreSchedule) "일정 변경이
  // 있나요?" 안내 화면(scheduleChanged)으로, 아니면 처음 묻는 화면
  // (hasRegularSchedule)으로 들어간다 — ConfirmScheduleModal/
  // PreScheduleRequiredModal 각각의 onConfirm. 정기 일정 건수로 재확인하지
  // 않는다 — hasCompletedPreSchedule 하나가 기준이다.
  const handleStartBasicInfo = () => {
    setBasicInfoInitialScreen(
      hasCompletedPreSchedule ? 'scheduleChanged' : 'hasRegularSchedule',
    );
    setIsBasicInfoOpen(true);
  };

  if (
    isGetRoomLoading ||
    isGetRoomMembersLoading ||
    isTripsLoading ||
    !hasHydrated
  ) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header
          variant="page"
          title="여행방 상세"
          onBack={() => router.push('/')}
        />
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (needsJoin || isPostTripsJoinPending) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header
          variant="page"
          title="여행방 상세"
          onBack={() => router.push('/')}
        />
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
        <AlertModal
          open={joinErrorMessage !== null}
          onOpenChange={(open) => !open && handleDismissJoinError()}
          variant="danger"
          title="참여하지 못했어요"
          description={joinErrorMessage ?? ''}
          primaryText="확인"
          onPrimaryClick={handleDismissJoinError}
        />
      </div>
    );
  }

  if (joinErrorMessage !== null) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header
          variant="page"
          title="여행방 상세"
          onBack={() => router.push('/')}
        />
        <AlertModal
          open
          onOpenChange={(open) => !open && handleDismissJoinError()}
          variant="danger"
          title="참여하지 못했어요"
          description={joinErrorMessage}
          primaryText="확인"
          onPrimaryClick={handleDismissJoinError}
        />
      </div>
    );
  }

  if (needsScheduleEntry) {
    if (isBasicInfoOpen) {
      // 갱신 입력은 scheduleChanged(안내 화면) 또는 regularScheduleDetail(목록
      // 화면) 어느 쪽으로 시작하든 같은 기존 데이터가 필요하다 — 두 값 모두
      // 갱신 입력 진입을 뜻한다.
      const isReturningUserEntry =
        basicInfoInitialScreen === 'scheduleChanged' ||
        basicInfoInitialScreen === 'regularScheduleDetail';

      // "정기 일정이 있나요?"에서 "네"를 고른 최초 입력이어도, 마이페이지 등에서
      // 이미 정기 일정을 저장해뒀을 수 있다(연차·휴일 정보만 아직 저장 안 해
      // hasCompletedPreSchedule은 false인 경우) — 그 데이터를 빈 폼으로 덮어쓰지
      // 않도록 항상 로딩이 끝난 뒤에 위저드를 연다.
      if (isRegularSchedulesLoading || isVacationPolicyLoading) {
        return (
          <div className="flex w-full flex-1 items-center justify-center">
            <Spinner />
          </div>
        );
      }

      const savedItems = regularSchedulesData ?? [];
      const vacationPolicyValue = vacationPolicyData
        ? mapVacationPolicyToClient(vacationPolicyData)
        : null;

      return (
        <>
          <BasicInfo
            allowSkip={false}
            initialScreen={basicInfoInitialScreen}
            initialValue={{
              ...DEFAULT_BASIC_INFO_VALUE,
              hasRegularSchedule: savedItems.length > 0,
              regularSchedules: savedItems.map(mapRegularScheduleItemToClient),
              annualLeaveCount: vacationPolicyValue?.annualLeaveCount ?? null,
              leaveNoticeDays: vacationPolicyValue?.leaveNoticeDays ?? null,
              includeHalfDayHoliday:
                vacationPolicyValue?.includeHalfDayHoliday ??
                DEFAULT_BASIC_INFO_VALUE.includeHalfDayHoliday,
            }}
            individualScheduleHeading={
              isReturningUserEntry ? (
                <>
                  여행 기간 중 여행이 어렵거나
                  <br />
                  확실하지 않은 날짜를 알려주세요.
                </>
              ) : undefined
            }
            individualScheduleDescription={
              isReturningUserEntry
                ? '앞서 입력한 출근 날은 여행 불가능한 날짜로 표시해 뒀어요.'
                : undefined
            }
            individualScheduleMinDate={tripMinDate}
            individualScheduleMaxDate={tripMaxDate}
            // 플로우 첫 화면(정기 일정 입력 화면)에서 뒤로가기로 위저드 자체를
            // 벗어날 때만 호출됨 — 위저드 내부 이동(개별 일정 → 정기 일정 등)은
            // BasicInfo가 자체 screenHistory로 처리하고 onExit을 타지 않는다.
            // join은 이미 완료돼 있어(SCHEDULE_PENDING) 되돌릴 필요가 없으므로,
            // 그냥 이전 화면으로 이동하면 된다 — 다음에 다시 들어오면 이 화면부터
            // 재개된다.
            onExit={() => router.back()}
            onComplete={() => {
              setIsBasicInfoOpen(false);
              setMemberStatusOverride('ACTIVE');
              refetchTrips();
              refetchRoom();
              refetchRoomMembers();
            }}
            onVacationPolicyNext={handleSaveVacationPolicy}
            onDeleteAllRegularSchedules={deleteAllRegularSchedulesMutation}
            onAddRegularSchedule={addRegularSchedule}
            onEditRegularSchedule={editRegularSchedule}
            onRemoveRegularSchedule={removeRegularSchedule}
            onRegularScheduleError={handleRegularScheduleError}
            onBeforeIndividualSchedule={handleBeforeIndividualSchedule}
            onBeforeComplete={handleSaveIndividualSchedule}
            completeTitle="일정 입력하기"
            completeDescription="일정 입력이 완료되었어요!"
            completePrimaryText="여행방 입장하기"
          />
          {confirmErrorModal}
          <AlertModal
            open={scheduleErrorMessage !== null}
            onOpenChange={(open) => !open && setScheduleErrorMessage(null)}
            variant="danger"
            title="문제가 발생했어요"
            description={scheduleErrorMessage ?? ''}
            primaryText="확인"
            onPrimaryClick={() => setScheduleErrorMessage(null)}
          />
        </>
      );
    }

    return (
      <div className="flex w-full flex-1 flex-col">
        <Header
          variant="page"
          title="여행방 상세"
          onBack={() => router.push('/')}
        />
        {hasCompletedPreSchedule ? (
          <ConfirmScheduleModal
            open
            onOpenChange={() => {}}
            onConfirm={handleStartBasicInfo}
          />
        ) : (
          <PreScheduleRequiredModal
            open
            onOpenChange={() => {}}
            onConfirm={handleStartBasicInfo}
          />
        )}
      </div>
    );
  }

  if (
    isGetRoomError ||
    isGetRoomMembersError ||
    !roomData ||
    !roomMembersData
  ) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header
          variant="page"
          title="여행방 상세"
          onBack={() => router.push('/')}
        />
        <div className="flex w-full flex-1 items-center justify-center">
          <span className="text-body-03 text-grey-500">
            여행방 정보를 불러오지 못했어요
          </span>
        </div>
      </div>
    );
  }

  const room = roomData;
  const participants = roomMembersData;
  const myName =
    participants.find((participant) => participant.isMe)?.name ?? '';
  const isConfirmed = room.status === 'CONFIRMED';
  const respondedCount = room.activeMemberCount;

  if (section === 'recommendation') {
    return (
      <>
        <RecommendationSection
          roomId={roomId}
          roomName={room.title}
          inviteCode={room.inviteCode}
          myName={myName}
          participants={participants}
          tripStartDate={room.startDate}
          tripEndDate={room.endDate}
          isHost={isHost}
          onExit={() => setSection('calendar')}
          respondedCount={respondedCount}
          onRequestResponse={() => setIsRequestResponseOpen(true)}
          isConfirmed={isConfirmed}
          onConfirmed={refetchRoom}
          confirmedStartDate={room.confirmedStartDate}
          confirmedEndDate={room.confirmedEndDate}
          confirmedAttendCount={room.confirmedAttendCount}
          confirmedVacationMemberCount={room.confirmedVacationMemberCount}
          confirmedUncertainCount={room.confirmedUncertainCount}
        />
        <ShareSheet
          open={isRequestResponseOpen}
          onOpenChange={setIsRequestResponseOpen}
          title="응답 요청하기"
          initialTitleValue={`${room.title} 일정 입력 요청`}
          initialDescriptionValue={SCHEDULE_REQUEST_SHARE_DESCRIPTION}
          linkPath={`/room/${roomId}?inviteCode=${room.inviteCode}`}
          buttonTitle="응답하기"
          onShare={() => {
            setIsRequestResponseOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <GroupCalendarSection
      room={room}
      participants={participants}
      capacity={room.memberCount}
      isHost={isHost}
      isConfirmed={isConfirmed}
      onShowRecommendation={() => setSection('recommendation')}
    />
  );
}

export default RoomDetailSection;
