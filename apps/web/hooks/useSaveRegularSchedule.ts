import { useQueryClient } from '@tanstack/react-query';

import { BasicInfoValue } from '@/components/basic-info/basicInfo.const';
import { useDeleteRegularSchedule } from '@/hooks/useDeleteRegularSchedule';
import {
  REGULAR_SCHEDULES_QUERY_KEY,
  useGetRegularSchedules,
} from '@/hooks/useGetRegularSchedules';
import { usePatchRegularSchedule } from '@/hooks/usePatchRegularSchedule';
import { usePostRegularSchedule } from '@/hooks/usePostRegularSchedule';
import { mapClientScheduleToRequestBody } from '@/utils/mapRegularSchedule';

export const useSaveRegularSchedule = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const { regularSchedulesData, isRegularSchedulesLoading } =
    useGetRegularSchedules(options);
  const { postRegularScheduleMutation } = usePostRegularSchedule();
  const { patchRegularScheduleMutation } = usePatchRegularSchedule();
  const { deleteRegularScheduleMutation } = useDeleteRegularSchedule();

  const saveRegularSchedule = async (value: BasicInfoValue) => {
    const savedIds = new Set(
      (regularSchedulesData ?? []).map((item) => item.id),
    );
    const currentIds = new Set(value.regularSchedules.map((s) => s.id));
    const vacationValue = {
      annualLeaveCount: value.annualLeaveCount,
      leaveNoticeDays: value.leaveNoticeDays,
      includeHalfDayHoliday: value.includeHalfDayHoliday,
    };

    await Promise.all([
      ...value.regularSchedules.map((schedule) => {
        const requestBody = mapClientScheduleToRequestBody(
          schedule,
          vacationValue,
        );
        return savedIds.has(schedule.id)
          ? patchRegularScheduleMutation({ id: schedule.id, ...requestBody })
          : postRegularScheduleMutation(requestBody);
      }),
      // UI에서 삭제한(더 이상 regularSchedules에 없는) 기존 서버 항목은 여기서 한 번에 반영한다 —
      // "삭제하기" 클릭 즉시 지우면 위저드를 저장 없이 나갔을 때도 이미 지워져버린다.
      ...[...savedIds]
        .filter((id) => !currentIds.has(id))
        .map((id) => deleteRegularScheduleMutation(id)),
    ]);
    await queryClient.invalidateQueries({
      queryKey: REGULAR_SCHEDULES_QUERY_KEY,
    });
  };

  return {
    regularSchedulesData,
    isRegularSchedulesLoading,
    saveRegularSchedule,
  };
};
