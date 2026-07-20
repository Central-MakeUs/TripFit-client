'use client';

import { useState } from 'react';
import { format, isBefore } from 'date-fns';

import ModifyIcon from '@/assets/icons/modify.svg';
import AlertModal from '@/components/alert-modal';
import Button from '@/components/button';
import { ParticipantT } from '@/types/participant';
import { RoomT } from '@/types/room';

import ParticipantManageList from './ParticipantManageList';

type RoomInfoViewProps = {
  room: RoomT;
  participants: ParticipantT[];
  capacity: number;
  isHost: boolean;
  onEdit: () => void;
  onInvite: () => void;
  onRemoveParticipant: (participant: ParticipantT) => void;
  onDeleteRoom: () => void;
  onLeaveRoom: () => void;
};

type InviteBlockedReasonT = 'expired' | 'full';

function RoomInfoView({
  room,
  participants,
  capacity,
  isHost,
  onEdit,
  onInvite,
  onRemoveParticipant,
  onDeleteRoom,
  onLeaveRoom,
}: RoomInfoViewProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] =
    useState<ParticipantT | null>(null);
  const [inviteBlockedReason, setInviteBlockedReason] =
    useState<InviteBlockedReasonT | null>(null);

  const startDate = new Date(room.startDate);
  const endDate = new Date(room.endDate);

  const handleInviteClick = () => {
    if (isBefore(endDate, new Date())) {
      setInviteBlockedReason('expired');
      return;
    }
    if (participants.length >= capacity) {
      setInviteBlockedReason('full');
      return;
    }
    onInvite();
  };

  const handleConfirmRemove = () => {
    if (participantToRemove) onRemoveParticipant(participantToRemove);
    setParticipantToRemove(null);
  };

  const handleConfirmDelete = () => {
    onDeleteRoom();
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="flex w-full flex-1 flex-col px-5">
      <div className="flex flex-col gap-4 pt-4 pb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-body-01 text-black">{room.title}</h1>
          <Button
            text="편집하기"
            size="M"
            style="weak"
            type="secondary"
            icon={<ModifyIcon className="size-4" />}
            iconPosition="right"
            onClick={onEdit}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <span className="w-9 text-caption-02 text-grey-400">기간</span>
            <span className="text-body-05 text-grey-800">
              {format(startDate, 'yy.MM.dd')} - {format(endDate, 'yy.MM.dd')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-9 text-caption-02 text-grey-400">일정</span>
            <span className="text-body-05 text-grey-800">
              {room.nights}박 {room.days}일
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-9 text-caption-02 text-grey-400">여행지</span>
            <span className="text-body-05 text-grey-800">
              {room.destination || '미정'}
            </span>
          </div>
        </div>
      </div>

      <ParticipantManageList
        participants={participants}
        capacity={capacity}
        onInvite={handleInviteClick}
        onRemove={setParticipantToRemove}
      />

      <div className="flex flex-1 flex-col gap-3 pt-4 pb-5">
        {isHost ? (
          <>
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="w-full cursor-pointer rounded-2xl bg-red-20 px-4 py-3 text-left text-body-06 text-red-300"
            >
              여행방 삭제하기
            </button>
            <p className="text-caption-04 text-grey-300">
              내가 만든 여행방 입니다.
              <br />
              삭제할 경우 참여 인원의 응답은 모두 삭제될 수 있습니다.
            </p>
          </>
        ) : (
          <button
            type="button"
            onClick={onLeaveRoom}
            className="w-full cursor-pointer rounded-2xl bg-red-20 px-4 py-3 text-left text-body-06 text-red-300"
          >
            여행방 나가기
          </button>
        )}
      </div>

      <AlertModal
        open={participantToRemove !== null}
        onOpenChange={(open) => !open && setParticipantToRemove(null)}
        title={`${participantToRemove?.name}님을 내보낼까요?`}
        description={
          <>
            내보내면 이 여행방에서의 일정과
            <br />
            참여 정보가 함께 제외돼요.
          </>
        }
        secondaryText="취소"
        onSecondaryClick={() => setParticipantToRemove(null)}
        primaryText="내보내기"
        onPrimaryClick={handleConfirmRemove}
      />

      <AlertModal
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        variant="danger"
        title="여행방을 삭제할까요?"
        description={
          <>
            삭제하면 참여 인원의
            <br />
            응답이 모두 삭제돼요.
          </>
        }
        secondaryText="취소"
        onSecondaryClick={() => setIsDeleteConfirmOpen(false)}
        primaryText="삭제하기"
        onPrimaryClick={handleConfirmDelete}
      />

      <AlertModal
        open={inviteBlockedReason === 'full'}
        onOpenChange={(open) => !open && setInviteBlockedReason(null)}
        title="참여 인원이 가득 찼어요"
        description={
          <>
            새로운 참여자를 초대하려면
            <br />
            기존 참여자를 내보내주세요.
          </>
        }
        primaryText="확인"
        onPrimaryClick={() => setInviteBlockedReason(null)}
      />

      <AlertModal
        open={inviteBlockedReason === 'expired'}
        onOpenChange={(open) => !open && setInviteBlockedReason(null)}
        title="여행 기간이 만료되었어요"
        description={
          <>
            진행 중인 여행방일 경우에만
            <br />
            참여자를 초대할 수 있어요.
          </>
        }
        primaryText="확인"
        onPrimaryClick={() => setInviteBlockedReason(null)}
      />
    </div>
  );
}

export default RoomInfoView;
