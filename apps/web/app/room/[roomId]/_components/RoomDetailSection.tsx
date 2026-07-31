'use client';

import { useState } from 'react';
import { addYears, format, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';

import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import { BasicInfoValue } from '@/components/basic-info/basicInfo.const';
import Header from '@/components/header';
import Spinner from '@/components/spinner';
import { useGetScheduleCalendar } from '@/hooks/useGetScheduleCalendar';
import { useGetTrips } from '@/hooks/useGetTrips';
import { usePatchPersonalSchedule } from '@/hooks/usePatchPersonalSchedule';
import { useRefreshScheduleStatus } from '@/hooks/useRefreshScheduleStatus';
import { useSaveRegularSchedule } from '@/hooks/useSaveRegularSchedule';
import { useAuthStore } from '@/stores/authStore';
import { IndividualScheduleValueT } from '@/types/schedule';
import { mapScheduleCalendarToIndividualScheduleValue } from '@/utils/mapScheduleCalendar';

import PreScheduleRequiredModal from '../../_common/_components/PreScheduleRequiredModal';
import { useScheduleConfirmGate } from '../../_common/_hooks/useScheduleConfirmGate';
import ShareSheet from '../../_common/_components/ShareSheet';
import { useGetRoom } from '../_common/_hooks/useGetRoom';
import { useGetRoomMembers } from '../_common/_hooks/useGetRoomMembers';
import GroupCalendarSection from './group-calendar/GroupCalendarSection';
import RecommendationSection from './recommendation/RecommendationSection';

type RoomDetailSectionProps = {
  roomId: string;
};

type SectionT = 'calendar' | 'recommendation';

function RoomDetailSection({ roomId }: RoomDetailSectionProps) {
  const router = useRouter();
  const [section, setSection] = useState<SectionT>('calendar');
  const [isRequestResponseOpen, setIsRequestResponseOpen] = useState(false);
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const [scheduleErrorMessage, setScheduleErrorMessage] = useState<
    string | null
  >(null);
  const {
    roomData,
    isGetRoomLoading,
    isGetRoomError,
    getRoomError,
    refetchRoom,
  } = useGetRoom(roomId);
  const {
    roomMembersData,
    isGetRoomMembersLoading,
    isGetRoomMembersError,
    refetchRoomMembers,
  } = useGetRoomMembers(roomId);
  const { confirmSchedule, confirmErrorModal } = useScheduleConfirmGate();

  const hasPreSchedule = useAuthStore((state) => state.hasPreSchedule);
  const isAllFree = useAuthStore((state) => state.isAllFree);

  // activate(POST /trips/{roomId}/activate)는 방장 전용 API라, getRoom()이
  // SCHEDULE_ENTRY_REQUIRED/SCHEDULE_ACTIVATION_REQUIRED로 에러난 상태에선
  // roomData가 없어 room.isHost를 못 쓰므로, 홈 화면과 동일하게 내 트립
  // 목록(myRole)을 따로 조회해 host 여부를 판단한다 — 활성화 여부와 무관하게
  // 항상 내려온다.
  const { tripsData, isTripsLoading } = useGetTrips({ scope: 'all' });
  const isHost =
    tripsData?.find((trip) => trip.tripId === roomId)?.myRole === 'OWNER';

  // 일정을 아직 못 쓰는 상태(한 번도 입력 안 함 또는 이 트립 활성화 전)는
  // 전부 하나로 묶어서 일정 입력 마법사로 보낸다. 백엔드가 이 코드를 안
  // 내려주는 경우까지 대비해, 정기/개별 일정을 한 번도 입력한 적 없는
  // (hasPreSchedule/isAllFree 둘 다 false) 사용자는 방 조회가 성공했더라도
  // 클라이언트 쪽에서 한 번 더 막는다. 다른 에러(권한 없음 등)일 때까지
  // 이걸로 덮어버리면 안 되므로 getRoomError가 없을 때만 적용한다.
  const needsScheduleEntry =
    getRoomError?.code === 'SCHEDULE_ENTRY_REQUIRED' ||
    getRoomError?.code === 'SCHEDULE_ACTIVATION_REQUIRED' ||
    (!isGetRoomError && !hasPreSchedule && !isAllFree);

  const { saveRegularSchedule } = useSaveRegularSchedule({ enabled: false });
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
  const { refetchScheduleCalendar } = useGetScheduleCalendar({
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(subDays(addYears(today, 2), 1), 'yyyy-MM-dd'),
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
    // activate는 방장 전용이라, 방장이 처음 일정을 입력하는 경우에만 여기서
    // 트립을 활성화한다. 참여자는 자기 일정 저장만으로 완료 화면으로 넘어간다.
    return isHost ? confirmSchedule(roomId) : true;
  };

  if (isGetRoomLoading || isGetRoomMembersLoading || isTripsLoading) {
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

  if (needsScheduleEntry) {
    if (isBasicInfoOpen) {
      return (
        <>
          <BasicInfo
            allowSkip={false}
            onComplete={() => {
              setIsBasicInfoOpen(false);
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
        <PreScheduleRequiredModal
          open
          onOpenChange={() => {}}
          onConfirm={() => setIsBasicInfoOpen(true)}
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
          myName={myName}
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
          initialDescriptionValue={
            '그때 얘기했던 여행 언제갈래?\n일정 공유해줘'
          }
          linkPath={`/room/${roomId}`}
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
