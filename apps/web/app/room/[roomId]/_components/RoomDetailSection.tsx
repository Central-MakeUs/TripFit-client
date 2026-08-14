'use client';

import { useEffect, useState } from 'react';
import { addYears, format, max, parseISO, subDays } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import {
  BasicInfoScreen,
  BasicInfoValue,
  DEFAULT_BASIC_INFO_VALUE,
} from '@/components/basic-info/basicInfo.const';
import Header from '@/components/header';
import Spinner from '@/components/spinner';
import { useGetScheduleCalendar } from '@/hooks/useGetScheduleCalendar';
import { useGetTrips } from '@/hooks/useGetTrips';
import { usePatchPersonalSchedule } from '@/hooks/usePatchPersonalSchedule';
import { useRefreshScheduleStatus } from '@/hooks/useRefreshScheduleStatus';
import { useSaveRegularSchedule } from '@/hooks/useSaveRegularSchedule';
import { useAuthStore } from '@/stores/authStore';
import { IndividualScheduleValueT } from '@/types/schedule';
import {
  getIncludeHalfDayHolidayFromRegularSchedules,
  getLeaveNoticeDaysFromRegularSchedules,
  mapRegularScheduleItemToClient,
} from '@/utils/mapRegularSchedule';
import { mapScheduleCalendarToIndividualScheduleValue } from '@/utils/mapScheduleCalendar';

import ConfirmScheduleModal from '../../_common/_components/ConfirmScheduleModal';
import PreScheduleRequiredModal from '../../_common/_components/PreScheduleRequiredModal';
import ShareSheet from '../../_common/_components/ShareSheet';
import { SCHEDULE_REQUEST_SHARE_DESCRIPTION } from '../../_common/_consts/shareMessages';
import { useScheduleConfirmGate } from '../../_common/_hooks/useScheduleConfirmGate';
import { useDeleteTripsJoinHold } from '../_common/_hooks/useDeleteTripsJoinHold';
import { useGetRoomMembers } from '../_common/_hooks/useGetRoomMembers';
import { useGetRoom } from '../../_common/_hooks/useGetRoom';
import { usePostTripsJoin } from '../_common/_hooks/usePostTripsJoin';
import { usePostTripsJoinHold } from '../_common/_hooks/usePostTripsJoinHold';
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
  const [leaveErrorMessage, setLeaveErrorMessage] = useState<string | null>(
    null,
  );
  // 초대 코드가 있으면 아직 이 방 멤버가 아닐 수 있으니, 실패가 뻔한 조회부터
  // 하지 않고 join을 먼저 시도한 뒤에야 방/멤버 조회를 켠다. 초대 코드가
  // 없는 일반 진입(이미 멤버)은 처음부터 그대로 조회한다.
  const [enableRoomQueries, setEnableRoomQueries] = useState(() => !inviteCode);
  const {
    roomData,
    isGetRoomLoading,
    isGetRoomError,
    getRoomError,
    refetchRoom,
  } = useGetRoom(roomId, { enabled: enableRoomQueries });
  const {
    roomMembersData,
    isGetRoomMembersLoading,
    isGetRoomMembersError,
    refetchRoomMembers,
  } = useGetRoomMembers(roomId, { enabled: enableRoomQueries });
  const { confirmSchedule, confirmErrorModal } = useScheduleConfirmGate();
  const { postTripsJoinMutation } = usePostTripsJoin();
  const { postTripsJoinHoldMutation } = usePostTripsJoinHold();
  const { deleteTripsJoinHoldMutation } = useDeleteTripsJoinHold();

  const hasPreSchedule = useAuthStore((state) => state.hasPreSchedule);
  const isAllFree = useAuthStore((state) => state.isAllFree);
  const hasSavedSchedule = hasPreSchedule || isAllFree;

  // hasPreSchedule/isAllFree는 persist된 store 값이라, 하이드레이션이 끝나기
  // 전엔 이미 일정을 입력한 사용자도 잠깐 기본값(false)으로 보인다 — 그 사이
  // needsScheduleEntry가 true로 잘못 계산돼 일정 입력 모달이 짧게 노출되는 걸
  // 막기 위해 하이드레이션 완료 여부를 별도로 추적한다.
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  // activate(POST /trips/{roomId}/activate)는 방장 전용 API라, getRoom()이
  // SCHEDULE_ENTRY_REQUIRED/SCHEDULE_ACTIVATION_REQUIRED로 에러난 상태에선
  // roomData가 없어 room.isHost를 못 쓰므로, 홈 화면과 동일하게 내 트립
  // 목록(myRole)을 따로 조회해 host 여부를 판단한다 — 활성화 여부와 무관하게
  // 항상 내려온다.
  const { tripsData, isTripsLoading } = useGetTrips({ scope: 'all' });
  const currentTrip = tripsData?.find((trip) => trip.tripId === roomId);
  const isHost = currentTrip?.myRole === 'OWNER';
  // roomData는 SCHEDULE_ENTRY_REQUIRED/SCHEDULE_ACTIVATION_REQUIRED 에러 상태에선
  // 비어 있어 여행 예상 기간을 알 수 없으므로, 활성화 여부와 무관하게 항상 내려오는
  // tripsData(홈 목록 조회)에서 대신 가져와 일정 입력/수정 캘린더를 이 기간으로 제한한다.
  const tripMinDate = currentTrip
    ? parseISO(currentTrip.startRange)
    : undefined;
  const tripMaxDate = currentTrip ? parseISO(currentTrip.endRange) : undefined;

  // 초대 코드가 있는데 아직 방/멤버 조회를 안 켠 상태 — 이 방 멤버인지 여부를
  // 미리 알 수 없으니, join을 먼저 시도(또는 그 전에 일정 입력부터)해야 한다.
  // 방 조회 자체에서 나는 TRIP_ACCESS_DENIED(이미 멤버인 줄 알았는데 아니었던
  // 경우 등 예외 상황)까지 함께 대비한다.
  const needsJoin =
    hasHydrated &&
    !!inviteCode &&
    (!enableRoomQueries || getRoomError?.code === 'TRIP_ACCESS_DENIED');

  // 일정을 아직 못 쓰는 상태(한 번도 입력 안 함 또는 이 트립 활성화 전)는
  // 전부 하나로 묶어서 일정 입력 마법사로 보낸다. 백엔드가 이 코드를 안
  // 내려주는 경우까지 대비해, 정기/개별 일정을 한 번도 입력한 적 없는
  // (hasPreSchedule/isAllFree 둘 다 false) 사용자는 방 조회가 성공했더라도
  // 클라이언트 쪽에서 한 번 더 막는다. 다른 에러(권한 없음 등)일 때까지
  // 이걸로 덮어버리면 안 되므로 getRoomError가 없을 때만 적용한다.
  // 초대 링크로 처음 들어온 신규 유저(아직 일정 자체가 없는 경우)도 참여
  // 전에 일정 입력부터 마쳐야 하므로 같은 마법사로 보낸다.
  const needsScheduleEntry =
    getRoomError?.code === 'SCHEDULE_ENTRY_REQUIRED' ||
    getRoomError?.code === 'SCHEDULE_ACTIVATION_REQUIRED' ||
    (needsJoin && !hasPreSchedule && !isAllFree) ||
    (enableRoomQueries && !isGetRoomError && !hasPreSchedule && !isAllFree);

  // 이미 일정을 입력해둔 사용자가 초대 링크로 새 방에 들어온 경우 — 일정
  // 입력 마법사 없이 초대 코드로 바로 참여 처리만 하면 된다.
  const needsJoinOnly = needsJoin && !needsScheduleEntry;

  // AlertModal은 primaryText 클릭뿐 아니라 Escape/배경 클릭으로도 onOpenChange(false)를
  // 호출한다 — 두 경로 모두 같은 동작(에러 닫고 홈으로 이동)을 하도록 하나로 묶는다.
  const handleDismissJoinError = () => {
    setJoinErrorMessage(null);
    router.push('/');
  };

  const handleJoinTrip = async (): Promise<boolean> => {
    if (!inviteCode) return true;
    try {
      await postTripsJoinMutation({ inviteCode });
      return true;
    } catch (error) {
      setJoinErrorMessage(
        error instanceof Error ? error.message : '참여하지 못했어요.',
      );
      return false;
    }
  };

  useEffect(() => {
    if (!needsJoinOnly) return;
    handleJoinTrip().then((joined) => {
      if (joined) setEnableRoomQueries(true);
    });
    // handleJoinTrip은 매 렌더마다 새로 만들어지는 클로저라 의존성에 넣으면
    // needsJoinOnly가 안 바뀌어도 재실행된다 — 이 값이 바뀔 때만(참여 시도가
    // 필요해졌을 때만) 한 번 실행하면 되므로 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsJoinOnly]);

  const {
    regularSchedulesData,
    isRegularSchedulesLoading,
    saveRegularSchedule,
  } = useSaveRegularSchedule({ enabled: hasSavedSchedule });
  const { refreshScheduleStatus } = useRefreshScheduleStatus();

  const handleSaveRegularSchedule = async (value: BasicInfoValue) => {
    try {
      await saveRegularSchedule(value);
      await refreshScheduleStatus();
      return true;
    } catch (error) {
      setScheduleErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
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
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
    // 초대 링크로 들어온 신규 유저는 일정 입력을 마친 뒤에야 초대 코드로
    // 참여 처리를 한다 — 참여 자체가 실패하면 완료 화면으로 넘어가지 않는다.
    if (needsJoin && !(await handleJoinTrip())) return false;
    // activate는 방장 전용이라, 방장이 처음 일정을 입력하는 경우에만 여기서
    // 트립을 활성화한다. 참여자는 자기 일정 저장만으로 완료 화면으로 넘어간다.
    return isHost ? confirmSchedule(roomId) : true;
  };

  // 기존에 저장된 일정이 있으면(hasSavedSchedule) 그 내용을 확인/수정하는
  // 화면(regularScheduleDetail)으로, 없으면 처음 묻는 화면(hasRegularSchedule)으로
  // 들어간다 — ConfirmScheduleModal/PreScheduleRequiredModal 각각의 onConfirm.
  // 초대 링크로 들어와 아직 멤버가 아닌 경우(needsJoin)엔, 일정 입력에 걸리는
  // 시간 동안 다른 사람에게 마지막 자리를 뺏기지 않도록 화면을 열기 직전에
  // 정원을 10분간 hold한다. 정원이 가득 찼으면(409) 화면을 열지 않고 안내한다.
  const handleStartBasicInfo = async () => {
    if (needsJoin && inviteCode) {
      try {
        await postTripsJoinHoldMutation({ inviteCode });
      } catch (error) {
        setJoinErrorMessage(
          error instanceof Error ? error.message : '참여하지 못했어요.',
        );
        return;
      }
    }
    setBasicInfoInitialScreen(
      hasSavedSchedule ? 'regularScheduleDetail' : 'hasRegularSchedule',
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

  if (needsJoinOnly) {
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

  if (needsScheduleEntry) {
    if (isBasicInfoOpen) {
      if (
        basicInfoInitialScreen === 'regularScheduleDetail' &&
        isRegularSchedulesLoading
      ) {
        return (
          <div className="flex w-full flex-1 items-center justify-center">
            <Spinner />
          </div>
        );
      }

      const savedItems = regularSchedulesData ?? [];

      return (
        <>
          <BasicInfo
            allowSkip={false}
            initialScreen={basicInfoInitialScreen}
            initialValue={
              basicInfoInitialScreen === 'regularScheduleDetail'
                ? {
                    ...DEFAULT_BASIC_INFO_VALUE,
                    hasRegularSchedule: savedItems.length > 0,
                    regularSchedules: savedItems.map(
                      mapRegularScheduleItemToClient,
                    ),
                    annualLeaveCount: savedItems[0]?.maxVacationDays ?? null,
                    leaveNoticeDays:
                      getLeaveNoticeDaysFromRegularSchedules(savedItems),
                    includeHalfDayHoliday:
                      getIncludeHalfDayHolidayFromRegularSchedules(savedItems),
                  }
                : undefined
            }
            individualScheduleHeading={
              basicInfoInitialScreen === 'regularScheduleDetail' ? (
                <>
                  여행 기간 중 여행이 어렵거나
                  <br />
                  확실하지 않은 날짜를 알려주세요.
                </>
              ) : undefined
            }
            individualScheduleDescription={
              basicInfoInitialScreen === 'regularScheduleDetail'
                ? '앞서 입력한 출근 날은 여행 불가능한 날짜로 표시해 뒀어요.'
                : undefined
            }
            individualScheduleMinDate={tripMinDate}
            individualScheduleMaxDate={tripMaxDate}
            // 플로우 첫 화면(정기 일정 입력 화면)에서 뒤로가기로 위저드 자체를
            // 벗어날 때만 호출됨 — 위저드 내부 이동(개별 일정 → 정기 일정 등)은
            // BasicInfo가 자체 screenHistory로 처리하고 onExit을 타지 않는다.
            // hold 해제가 끝나기 전에 화면을 나가면 다른 사용자가 자리를 못 받는
            // 채로 TTL까지 남으므로, 해제가 완료된 뒤에만 이전 화면으로 이동한다.
            // 실패하면 현재 화면에 남겨 재시도할 수 있게 한다.
            onExit={async () => {
              if (needsJoin) {
                try {
                  await deleteTripsJoinHoldMutation(roomId);
                } catch (error) {
                  setLeaveErrorMessage(
                    error instanceof Error
                      ? error.message
                      : '참여를 취소하지 못했어요.',
                  );
                  return;
                }
              }
              router.back();
            }}
            onComplete={() => {
              setIsBasicInfoOpen(false);
              setEnableRoomQueries(true);
              refetchRoom();
              refetchRoomMembers();
            }}
            onRegularScheduleNext={handleSaveRegularSchedule}
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
          <AlertModal
            open={leaveErrorMessage !== null}
            onOpenChange={(open) => !open && setLeaveErrorMessage(null)}
            variant="danger"
            title="나가지 못했어요"
            description={leaveErrorMessage ?? ''}
            primaryText="확인"
            onPrimaryClick={() => setLeaveErrorMessage(null)}
          />
          <AlertModal
            open={joinErrorMessage !== null}
            onOpenChange={(open) => !open && setJoinErrorMessage(null)}
            variant="danger"
            title="참여하지 못했어요"
            description={joinErrorMessage ?? ''}
            primaryText="확인"
            onPrimaryClick={() => setJoinErrorMessage(null)}
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
        {hasSavedSchedule ? (
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
