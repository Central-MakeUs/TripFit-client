import { request } from '@/apis/request';
import { DayScheduleValueT } from '@/types/schedule';
import { areSlotsEqual, DEFAULT_DAY_VALUE } from '@/utils/dayScheduleValue';

type PersonalScheduleSlotStatusT = 'POSSIBLE' | 'IMPOSSIBLE';

const toSlotStatus = (
  status: DayScheduleValueT['morning'],
): PersonalScheduleSlotStatusT =>
  status === 'available' ? 'POSSIBLE' : 'IMPOSSIBLE';

export type PatchPersonalScheduleRequestT = {
  date: string;
  value: DayScheduleValueT;
  /** 편집 시작 시점의 값 — 슬롯/uncertain 각각 이 값과 같으면(즉 안 건드린 필드면)
   * 해당 필드 자체를 생략해서 보낸다 (스펙 시나리오 2/4/6) */
  baseline: DayScheduleValueT;
};

export const patchPersonalSchedule = async (
  requestBody: PatchPersonalScheduleRequestT,
): Promise<void> => {
  const baseline = requestBody.baseline ?? DEFAULT_DAY_VALUE;
  const slotsChanged = !areSlotsEqual(requestBody.value, baseline);
  const uncertainChanged =
    requestBody.value.isUncertain !== baseline.isUncertain;

  await request(`/api/v1/users/schedule/personal`, {
    method: 'PATCH',
    data: {
      items: [
        {
          scheduleDate: requestBody.date,
          ...(slotsChanged && {
            slots: {
              morningStatus: toSlotStatus(requestBody.value.morning),
              afternoonStatus: toSlotStatus(requestBody.value.afternoon),
              eveningStatus: toSlotStatus(requestBody.value.evening),
            },
          }),
          ...(uncertainChanged && { uncertain: requestBody.value.isUncertain }),
        },
      ],
    },
  });
};
