import { useMutation } from '@tanstack/react-query';

import { postScheduleConfirm } from '../_apis/postScheduleConfirm';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const usePostScheduleConfirm = () => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const {
    mutate: postScheduleConfirmMutation,
    isPending: isPostScheduleConfirmPending,
  } = useMutation({
    mutationFn: (roomId: string) => postScheduleConfirm(roomId, userId),
  });

  return { postScheduleConfirmMutation, isPostScheduleConfirmPending };
};
