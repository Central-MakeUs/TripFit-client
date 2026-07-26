'use client';

import { useState } from 'react';

import Header from '@/components/header';
import Spinner from '@/components/spinner';

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
  const { roomData, isGetRoomLoading, isGetRoomError } = useGetRoom(roomId);
  const { roomMembersData, isGetRoomMembersLoading, isGetRoomMembersError } =
    useGetRoomMembers(roomId);

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
