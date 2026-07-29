import { useMutation } from '@tanstack/react-query';

import {
  patchPersonalSchedule,
  PatchPersonalScheduleRequestT,
} from '../_apis/patchPersonalSchedule';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const usePatchPersonalSchedule = () => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const {
    mutate: patchPersonalScheduleMutation,
    isPending: isPatchPersonalSchedulePending,
  } = useMutation({
    mutationFn: (requestBody: PatchPersonalScheduleRequestT) =>
      patchPersonalSchedule(requestBody, userId),
  });

  return { patchPersonalScheduleMutation, isPatchPersonalSchedulePending };
};
