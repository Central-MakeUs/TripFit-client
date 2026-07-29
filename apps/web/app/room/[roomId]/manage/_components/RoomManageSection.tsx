'use client';

import { useState } from 'react';

import NotificationsOffIcon from '@/assets/icons/notifications-off.svg';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import Spinner from '@/components/spinner';

import { useGetRoom } from '../../_common/_hooks/useGetRoom';
import { useGetRoomMembers } from '../../_common/_hooks/useGetRoomMembers';
import RoomEditForm from './RoomEditForm';
import RoomInfoView from './RoomInfoView';

type RoomManageSectionProps = {
  roomId: string;
};

type ModeT = 'view' | 'edit';

function RoomManageSection({ roomId }: RoomManageSectionProps) {
  const [mode, setMode] = useState<ModeT>('view');
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
          capacity={room.memberCount}
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
