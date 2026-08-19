'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 알림 끄기 버튼과 함께 주석 처리 — 재연동 시 되살릴 것
// import NotificationsOffIcon from '@/assets/icons/notifications-off.svg';
import AlertModal from '@/components/alert-modal';
import Header from '@/components/header';
// import IconButton from '@/components/icon-button';
import Spinner from '@/components/spinner';

import ShareSheet from '../../../_common/_components/ShareSheet';
import { useGetRoom } from '../../../_common/_hooks/useGetRoom';
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
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    roomData,
    isGetRoomLoading,
    isGetRoomError,
    getRoomError,
    refetchRoom,
  } = useGetRoom(roomId);

  // 일정 확인(activate)을 아직 안 마친 상태(SCHEDULE_PENDING)로 이 화면에
  // 직접 진입하면 방 상세 조회가 403으로 실패한다 — 일반 에러로 보여주지 말고
  // 일정 입력 흐름을 자체적으로 처리하는 방 상세 화면으로 보낸다.
  useEffect(() => {
    if (getRoomError?.code === 'SCHEDULE_ACTIVATION_REQUIRED') {
      router.replace(`/room/${roomId}`);
    }
  }, [getRoomError, roomId, router]);
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

  if (
    isGetRoomLoading ||
    isGetRoomMembersLoading ||
    getRoomError?.code === 'SCHEDULE_ACTIVATION_REQUIRED'
  ) {
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
  const isHost = room.isHost;

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header
        variant="page"
        title={mode === 'view' ? '여행방 상세' : '여행방 편집'}
        onBack={mode === 'edit' ? () => setMode('view') : undefined}
        // 알림 끄기 API 연동 전까지 버튼을 숨겨둔다.
        // rightSlot={
        //   mode === 'view' ? (
        //     <IconButton
        //       aria-label="알림 끄기"
        //       icon={<NotificationsOffIcon className="text-grey-500" />}
        //       onClick={() => {
        //         // TODO: 여행방 알림 끄기 API 연동
        //       }}
        //     />
        //   ) : undefined
        // }
      />

      {mode === 'view' ? (
        <RoomInfoView
          room={room}
          participants={participants}
          capacity={room.memberCount}
          isHost={isHost}
          onEdit={() => setMode('edit')}
          onInvite={() => setIsInviteSheetOpen(true)}
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

      <ShareSheet
        open={isInviteSheetOpen}
        onOpenChange={setIsInviteSheetOpen}
        title="참여자 초대하기"
        initialTitleValue={`${room.title} 초대`}
        initialDescriptionValue="일정 입력하고 같이 여행 떠나자!"
        // 초대 코드는 화면에 노출하지 않고 쿼리 파라미터로만 실어 보낸다 — 방
        // 상세 화면이 이 코드로 POST /api/v1/trips/join을 호출해 참여 처리한다.
        // 로그인/참여 전 사용자는 AuthGuard에 의해 /signup으로 리다이렉트됐다가
        // 로그인 완료 후 이 경로(쿼리 포함)로 다시 돌아온다.
        linkPath={`/room/${roomId}?inviteCode=${room.inviteCode}`}
        buttonTitle="여행방 참여하기"
        onShare={() => {
          setIsInviteSheetOpen(false);
        }}
      />

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
