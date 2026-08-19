'use client';

import { useState } from 'react';

import { ApiError } from '@/apis/request';
import AlertModal from '@/components/alert-modal';

import { usePostScheduleConfirm } from './usePostScheduleConfirm';

export const useScheduleConfirmGate = () => {
  // 정상 플로우에서는 연차·휴일 정보 저장을 반드시 거치므로 PRE_SCHEDULE_REQUIRED가
  // 나올 일이 없다 — 나온다면 어딘가 그 단계를 건너뛸 수 있는 경로가 남아있다는
  // 신호다. "권한 없음"처럼 보이는 일반 에러로 뭉뚱그리지 않고, 사전 일정
  // 미완료라는 사실을 그대로 안내한다.
  const [confirmErrorReason, setConfirmErrorReason] = useState<
    'preScheduleRequired' | 'unknown' | null
  >(null);
  const { postScheduleConfirmMutationAsync } = usePostScheduleConfirm();

  const confirmSchedule = async (roomId: string): Promise<boolean> => {
    try {
      await postScheduleConfirmMutationAsync(roomId);
      return true;
    } catch (error) {
      setConfirmErrorReason(
        error instanceof ApiError && error.code === 'PRE_SCHEDULE_REQUIRED'
          ? 'preScheduleRequired'
          : 'unknown',
      );
      return false;
    }
  };

  const confirmErrorModal = (
    <AlertModal
      open={confirmErrorReason !== null}
      onOpenChange={(open) => !open && setConfirmErrorReason(null)}
      variant="danger"
      title={
        confirmErrorReason === 'preScheduleRequired'
          ? '연차·휴일 정보를 먼저 저장해주세요'
          : '일정 확인을 완료하지 못했어요'
      }
      description={
        confirmErrorReason === 'preScheduleRequired'
          ? '이전 단계로 돌아가 저장을 마친 뒤 다시 시도해주세요'
          : '잠시 후 다시 시도해주세요'
      }
      primaryText="확인"
      onPrimaryClick={() => setConfirmErrorReason(null)}
    />
  );

  return { confirmSchedule, confirmErrorModal };
};
