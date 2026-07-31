import { useMutation } from '@tanstack/react-query';

import { getAuthMe } from '@/apis/auth';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';
import { useAuthStore } from '@/stores/authStore';

// 정기/개별 일정 저장은 서버에서 hasPreSchedule/isAllFree를 바꿀 수 있는데, 그 조건을
// 프론트가 정확히 알 수 없으므로(정기만 저장해도 되는지, 개별까지 필요한지 등) 직접
// 추측해서 로컬 상태를 갱신하지 않고 서버에서 재조회해 진짜 값으로 맞춘다.
export const useRefreshScheduleStatus = () => {
  const setScheduleStatus = useAuthStore((state) => state.setScheduleStatus);
  const mutationFn = useAuthenticatedMutationFn(getAuthMe);

  const { mutateAsync: refreshScheduleStatus } = useMutation({
    mutationFn: () => mutationFn(undefined),
    onSuccess: (user) => {
      setScheduleStatus({
        hasPreSchedule: user.hasPreSchedule,
        isAllFree: user.isAllFree,
      });
    },
  });

  return { refreshScheduleStatus };
};
