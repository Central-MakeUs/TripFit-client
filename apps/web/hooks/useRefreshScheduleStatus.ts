import { useMutation } from '@tanstack/react-query';

import { getAuthMe } from '@/apis/auth';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';
import { useAuthStore } from '@/stores/authStore';

// 연차·휴일 정보 저장은 서버에서 hasCompletedPreSchedule을 바꾸는데, 그 시점을 프론트가
// 정확히 알 수 없으므로 직접 추측해서 로컬 상태를 갱신하지 않고 서버에서 재조회해 진짜
// 값으로 맞춘다.
export const useRefreshScheduleStatus = () => {
  const setScheduleStatus = useAuthStore((state) => state.setScheduleStatus);
  const mutationFn = useAuthenticatedMutationFn(getAuthMe);

  const { mutateAsync: refreshScheduleStatus } = useMutation({
    mutationFn: () => mutationFn(undefined),
    onSuccess: (user) => {
      setScheduleStatus({
        hasCompletedPreSchedule: user.hasCompletedPreSchedule,
      });
    },
  });

  return { refreshScheduleStatus };
};
