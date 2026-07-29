'use client';

import { useState } from 'react';

import BasicInfo from '@/components/basic-info';
import Header from '@/components/header';
import Spinner from '@/components/spinner';

import PreScheduleRequiredModal from '../../_common/_components/PreScheduleRequiredModal';
import { useScheduleConfirmGate } from '../../_common/_hooks/useScheduleConfirmGate';
import ShareSheet from '../_common/_components/ShareSheet';
import { useGetRoom } from '../_common/_hooks/useGetRoom';
import { useGetRoomMembers } from '../_common/_hooks/useGetRoomMembers';
import GroupCalendarSection from './group-calendar/GroupCalendarSection';
import RecommendationSection from './recommendation/RecommendationSection';

type RoomDetailSectionProps = {
  roomId: string;
};

type SectionT = 'calendar' | 'recommendation';

function RoomDetailSection({ roomId }: RoomDetailSectionProps) {
  const [section, setSection] = useState<SectionT>('calendar');
  const [isRequestResponseOpen, setIsRequestResponseOpen] = useState(false);
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const {
    roomData,
    isGetRoomLoading,
    isGetRoomError,
    getRoomError,
    refetchRoom,
  } = useGetRoom(roomId);
  const { roomMembersData, isGetRoomMembersLoading, isGetRoomMembersError } =
    useGetRoomMembers(roomId);
  const { confirmSchedule, confirmErrorModal } = useScheduleConfirmGate();

  if (isGetRoomLoading || isGetRoomMembersLoading) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header variant="page" title="여행방 상세" />
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  const needsScheduleConfirm =
    getRoomError?.code === 'SCHEDULE_CONFIRM_REQUIRED';
  const needsScheduleEntry = getRoomError?.code === 'SCHEDULE_ENTRY_REQUIRED';

  if (needsScheduleConfirm || needsScheduleEntry) {
    if (isBasicInfoOpen) {
      return (
        <>
          <BasicInfo
            allowSkip={false}
            onComplete={() => {
              setIsBasicInfoOpen(false);
              refetchRoom();
            }}
            onRegularScheduleNext={() => {
              // TODO: 정기 일정 저장 API 연동
            }}
            onBeforeComplete={async () => {
              // TODO: 개별 일정 저장 API 연동 (confirm/재조회 전에 완료되어야 함)
              if (needsScheduleConfirm) {
                return confirmSchedule(roomId);
              }
              // needsScheduleEntry: 개별 일정 저장 API가 붙기 전까지는 실제로
              // 저장된 게 없으므로 완료 화면으로 넘어가지 않는다. 저장 API
              // 연동 후에는 저장 성공 시에만 true를 반환하도록 채울 것.
              return false;
            }}
            completeTitle="일정 입력하기"
            completeDescription="일정 입력이 완료되었어요!"
            completePrimaryText="여행방 입장하기"
          />
          {confirmErrorModal}
        </>
      );
    }

    return (
      <div className="flex w-full flex-1 flex-col">
        <Header variant="page" title="여행방 상세" />
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
        <Header variant="page" title="여행방 상세" />
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
  const isHost =
    participants.find((participant) => participant.isMe)?.isHost ?? false;
  const isConfirmed = room.status === 'CONFIRMED';

  if (section === 'recommendation') {
    return (
      <>
        <RecommendationSection
          roomName={room.title}
          onExit={() => setSection('calendar')}
          respondedCount={participants.length}
          onRequestResponse={() => setIsRequestResponseOpen(true)}
          isConfirmed={isConfirmed}
        />
        <ShareSheet
          open={isRequestResponseOpen}
          onOpenChange={setIsRequestResponseOpen}
          title="응답 요청하기"
          initialTitleValue={`${room.title} 일정 입력 요청`}
          initialDescriptionValue="아직 일정 입력 안 한 사람들은 얼른 입력해줘!"
          onShare={() => {
            // TODO: 응답 요청 알림 발송 API/카카오톡 공유 연동
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
