import { useQueryClient } from '@tanstack/react-query';

import { BasicInfoValue } from '@/components/basic-info/basicInfo.const';
import {
  useGetVacationPolicy,
  VACATION_POLICY_QUERY_KEY,
} from '@/hooks/useGetVacationPolicy';
import { usePatchVacationPolicy } from '@/hooks/usePatchVacationPolicy';
import { mapClientVacationPolicyToRequestBody } from '@/utils/mapVacationPolicy';

// 연차·반차·공휴일 정책은 정기 일정과 완전히 분리된 사용자당 1개짜리 리소스라,
// 정기 일정 개수와 무관하게 항상 이 한 번의 PATCH로 저장한다(전체 교체).
export const useSaveVacationPolicy = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const { vacationPolicyData, isVacationPolicyLoading } =
    useGetVacationPolicy(options);
  const { patchVacationPolicyMutation } = usePatchVacationPolicy();

  const saveVacationPolicy = async (value: BasicInfoValue) => {
    await patchVacationPolicyMutation(
      mapClientVacationPolicyToRequestBody({
        annualLeaveCount: value.annualLeaveCount,
        leaveNoticeDays: value.leaveNoticeDays,
        includeHalfDayHoliday: value.includeHalfDayHoliday,
      }),
    );
    await queryClient.invalidateQueries({
      queryKey: VACATION_POLICY_QUERY_KEY,
    });
  };

  return { vacationPolicyData, isVacationPolicyLoading, saveVacationPolicy };
};
