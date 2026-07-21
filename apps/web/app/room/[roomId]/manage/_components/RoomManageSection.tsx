'use client';

import { useState } from 'react';

import NotificationsOffIcon from '@/assets/icons/notifications-off.svg';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import {
  MOCK_PARTICIPANTS,
  MOCK_ROOM,
  MOCK_ROOM_CAPACITY,
} from '../../_common/_mocks/room';
import RoomEditForm from './RoomEditForm';
import RoomInfoView from './RoomInfoView';

type RoomManageSectionProps = {
  roomId: string;
};

type ModeT = 'view' | 'edit';

function RoomManageSection({ roomId }: RoomManageSectionProps) {
  const [mode, setMode] = useState<ModeT>('view');
  // TODO: 실제 API 연동 전까지 roomId 기반 mock 데이터 사용
  const room = { ...MOCK_ROOM, id: Number(roomId) || MOCK_ROOM.id };
  const participants = MOCK_PARTICIPANTS;
  const isHost = participants.find((p) => p.isMe)?.isHost ?? false;

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header
        variant="page"
        title={mode === 'view' ? '여행방 상세' : '여행방 편집'}
        onBack={mode === 'edit' ? () => setMode('view') : undefined}
        rightSlot={
          mode === 'view' ? (
            <IconButton
              aria-label="알림 끄기"
              icon={<NotificationsOffIcon className="text-grey-500" />}
              onClick={() => {
                // TODO: 여행방 알림 끄기 API 연동
              }}
            />
          ) : undefined
        }
      />

      {mode === 'view' ? (
        <RoomInfoView
          room={room}
          participants={participants}
          capacity={MOCK_ROOM_CAPACITY}
          isHost={isHost}
          onEdit={() => setMode('edit')}
          onInvite={() => {
            // TODO: 초대 링크 공유 플로우 연결
          }}
          onRemoveParticipant={() => {
            // TODO: 참여자 내보내기 API 연동
          }}
          onDeleteRoom={() => {
            // TODO: 여행방 삭제 확인 모달 및 API 연동
          }}
          onLeaveRoom={() => {
            // TODO: 여행방 나가기 확인 모달 및 API 연동
          }}
        />
      ) : (
        <RoomEditForm
          room={room}
          onSave={() => {
            // TODO: 여행방 정보 수정 API 연동
            setMode('view');
          }}
        />
      )}
    </div>
  );
}

export default RoomManageSection;
