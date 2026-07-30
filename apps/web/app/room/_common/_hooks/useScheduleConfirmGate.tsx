'use client';

import { useState } from 'react';

import AlertModal from '@/components/alert-modal';

import { usePostScheduleConfirm } from './usePostScheduleConfirm';

export const useScheduleConfirmGate = () => {
  const [isConfirmErrorOpen, setIsConfirmErrorOpen] = useState(false);
  const { postScheduleConfirmMutationAsync } = usePostScheduleConfirm();

  const confirmSchedule = async (roomId: string): Promise<boolean> => {
    try {
      await postScheduleConfirmMutationAsync(roomId);
      return true;
    } catch {
      setIsConfirmErrorOpen(true);
      return false;
    }
  };

  const confirmErrorModal = (
    <AlertModal
      open={isConfirmErrorOpen}
      onOpenChange={setIsConfirmErrorOpen}
      variant="danger"
      title="일정 확인을 완료하지 못했어요"
      description="잠시 후 다시 시도해주세요"
      primaryText="확인"
      onPrimaryClick={() => setIsConfirmErrorOpen(false)}
    />
  );

  return { confirmSchedule, confirmErrorModal };
};
