'use client';

import { useState } from 'react';

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
  // TODO: 실제 API 연동 전까지 roomId 기반 mock 데이터 사용
  const room = { ...MOCK_ROOM, id: Number(roomId) || MOCK_ROOM.id };
  const participants = MOCK_PARTICIPANTS;

  if (section === 'recommendation') {
    return (
      <RecommendationSection
        roomName={room.title}
        onExit={() => setSection('calendar')}
        respondedCount={participants.length}
        onRequestResponse={() => {
          // TODO: 응답 요청 알림 발송 플로우 연결
        }}
      />
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
