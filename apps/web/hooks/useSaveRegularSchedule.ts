import { useQueryClient } from '@tanstack/react-query';

import { useDeleteRegularSchedule } from '@/hooks/useDeleteRegularSchedule';
import {
  REGULAR_SCHEDULES_QUERY_KEY,
  useGetRegularSchedules,
} from '@/hooks/useGetRegularSchedules';
import { usePatchRegularSchedule } from '@/hooks/usePatchRegularSchedule';
import { usePostRegularSchedule } from '@/hooks/usePostRegularSchedule';
import { RegularScheduleT } from '@/types/schedule';
import {
  mapClientScheduleToRequestBody,
  mapRegularScheduleItemToClient,
} from '@/utils/mapRegularSchedule';

// 정기 일정은 항목을 추가·수정·삭제하는 그 순간 바로 API를 쏜다(백엔드가 그렇게
// 설계됨) — 위저드를 나갈 때 한꺼번에 diff해서 저장하지 않는다. 실패하면 그대로
// 던지므로, 호출부(RegularScheduleDetailStep을 감싸는 각 화면)가 잡아서
// AlertModal로 안내한다.
export const useSaveRegularSchedule = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const {
    regularSchedulesData,
    isRegularSchedulesLoading,
    refetchRegularSchedules,
  } = useGetRegularSchedules(options);
  const { postRegularScheduleMutation } = usePostRegularSchedule();
  const { patchRegularScheduleMutation } = usePatchRegularSchedule();
  const { deleteRegularScheduleMutation } = useDeleteRegularSchedule();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: REGULAR_SCHEDULES_QUERY_KEY });

  const addRegularSchedule = async (
    schedule: Omit<RegularScheduleT, 'id'>,
  ): Promise<RegularScheduleT> => {
    const savedItem = await postRegularScheduleMutation(
      mapClientScheduleToRequestBody(schedule as RegularScheduleT),
    );
    await invalidate();
    return mapRegularScheduleItemToClient(savedItem);
  };

  const editRegularSchedule = async (
    schedule: RegularScheduleT,
  ): Promise<RegularScheduleT> => {
    const savedItem = await patchRegularScheduleMutation({
      id: schedule.id,
      ...mapClientScheduleToRequestBody(schedule),
    });
    await invalidate();
    return mapRegularScheduleItemToClient(savedItem);
  };

  const removeRegularSchedule = async (id: string): Promise<void> => {
    await deleteRegularScheduleMutation(id);
    await invalidate();
  };

  return {
    regularSchedulesData,
    isRegularSchedulesLoading,
    refetchRegularSchedules,
    addRegularSchedule,
    editRegularSchedule,
    removeRegularSchedule,
  };
};
