'use client';

import { useState } from 'react';

import ShareSheet from '../_common/_components/ShareSheet';
import {
  MOCK_PARTICIPANTS,
  MOCK_ROOM,
  MOCK_ROOM_CAPACITY,
} from '../_common/_mocks/room';
import GroupCalendarSection from './group-calendar/GroupCalendarSection';
import RecommendationSection from './recommendation/RecommendationSection';

type RoomDetailSectionProps = {
  roomId: string;
};

type SectionT = 'calendar' | 'recommendation';

function RoomDetailSection({ roomId }: RoomDetailSectionProps) {
  const [section, setSection] = useState<SectionT>('calendar');
  const [isRequestResponseOpen, setIsRequestResponseOpen] = useState(false);
  // TODO: 실제 API 연동 전까지 roomId 기반 mock 데이터 사용
  const room = { ...MOCK_ROOM, id: Number(roomId) || MOCK_ROOM.id };
  const participants = MOCK_PARTICIPANTS;

  if (section === 'recommendation') {
    return (
      <>
        <RecommendationSection
          roomName={room.title}
          onExit={() => setSection('calendar')}
          respondedCount={participants.length}
          onRequestResponse={() => setIsRequestResponseOpen(true)}
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
      capacity={MOCK_ROOM_CAPACITY}
      onShowRecommendation={() => setSection('recommendation')}
    />
  );
}

export default RoomDetailSection;
