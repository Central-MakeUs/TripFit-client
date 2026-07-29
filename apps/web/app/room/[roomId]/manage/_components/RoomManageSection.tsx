'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import NotificationsOffIcon from '@/assets/icons/notifications-off.svg';
import AlertModal from '@/components/alert-modal';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import Spinner from '@/components/spinner';

import { useGetRoom } from '../../_common/_hooks/useGetRoom';
import { useGetRoomMembers } from '../../_common/_hooks/useGetRoomMembers';
import { useDeleteMyRoomMember } from '../_hooks/useDeleteMyRoomMember';
import { useDeleteRoom } from '../_hooks/useDeleteRoom';
import { useDeleteRoomMember } from '../_hooks/useDeleteRoomMember';
import { usePatchRoom } from '../_hooks/usePatchRoom';
import RoomEditForm from './RoomEditForm';
import RoomInfoView from './RoomInfoView';

type RoomManageSectionProps = {
  roomId: string;
};

type ModeT = 'view' | 'edit';

function RoomManageSection({ roomId }: RoomManageSectionProps) {
  const router = useRouter();
  const [mode, setMode] = useState<ModeT>('view');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { roomData, isGetRoomLoading, isGetRoomError, refetchRoom } =
    useGetRoom(roomId);
  const {
    roomMembersData,
    isGetRoomMembersLoading,
    isGetRoomMembersError,
    refetchRoomMembers,
  } = useGetRoomMembers(roomId);
  const { patchRoomMutation } = usePatchRoom();
  const { deleteMyRoomMemberMutation } = useDeleteMyRoomMember();
  const { deleteRoomMemberMutation } = useDeleteRoomMember();
  const { deleteRoomMutation } = useDeleteRoom();

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
          onRemoveParticipant={(participant) => {
            deleteRoomMemberMutation(
              { roomId, targetUserId: participant.id },
              {
                onSuccess: () => refetchRoomMembers(),
                onError: () => setErrorMessage('참여자를 내보내지 못했어요'),
              },
            );
          }}
          onDeleteRoom={() => {
            deleteRoomMutation(roomId, {
              onSuccess: () => router.push('/'),
              onError: () => setErrorMessage('여행방을 삭제하지 못했어요'),
            });
          }}
          onLeaveRoom={() => {
            deleteMyRoomMemberMutation(roomId, {
              onSuccess: () => router.push('/'),
              onError: () => setErrorMessage('여행방을 나가지 못했어요'),
            });
          }}
        />
      ) : (
        <RoomEditForm
          room={room}
          onSave={(value) => {
            patchRoomMutation(
              {
                roomId,
                requestBody: {
                  title: value.title,
                  memberCount: room.memberCount,
                  nights: value.isDurationUndecided
                    ? null
                    : Number(value.nights),
                  days: value.isDurationUndecided ? null : Number(value.days),
                  destination: value.destination || null,
                },
              },
              {
                onSuccess: () => {
                  refetchRoom();
                  setMode('view');
                },
                onError: () =>
                  setErrorMessage('여행방 정보를 저장하지 못했어요'),
              },
            );
          }}
        />
      )}

      <AlertModal
        open={errorMessage !== null}
        onOpenChange={(open) => !open && setErrorMessage(null)}
        variant="danger"
        title={errorMessage ?? ''}
        description="잠시 후 다시 시도해주세요"
        primaryText="확인"
        onPrimaryClick={() => setErrorMessage(null)}
      />
    </div>
  );
}

export default RoomManageSection;
