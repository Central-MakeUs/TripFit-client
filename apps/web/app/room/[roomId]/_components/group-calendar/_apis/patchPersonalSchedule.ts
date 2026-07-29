import { request } from '@/apis/request';
import { DayScheduleValueT } from '@/types/schedule';

type PersonalScheduleSlotStatusT = 'POSSIBLE' | 'IMPOSSIBLE';

const toSlotStatus = (
  status: DayScheduleValueT['morning'],
): PersonalScheduleSlotStatusT =>
  status === 'available' ? 'POSSIBLE' : 'IMPOSSIBLE';

export type PatchPersonalScheduleRequestT = {
  date: string;
  value: DayScheduleValueT;
};

export const patchPersonalSchedule = async (
  requestBody: PatchPersonalScheduleRequestT,
  userId: string,
): Promise<void> => {
  await request(`/api/v1/users/schedule/personal?userId=${userId}`, {
    method: 'PATCH',
    data: {
      items: [
        {
          scheduleDate: requestBody.date,
          morningStatus: toSlotStatus(requestBody.value.morning),
          afternoonStatus: toSlotStatus(requestBody.value.afternoon),
          eveningStatus: toSlotStatus(requestBody.value.evening),
          uncertain: requestBody.value.isUncertain,
        },
      ],
    },
  });
};
