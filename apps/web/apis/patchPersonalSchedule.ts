import { format } from 'date-fns';

import { request } from '@/apis/request';
import { DayScheduleValueT, IndividualScheduleValueT } from '@/types/schedule';
import { areSlotsEqual, DEFAULT_DAY_VALUE } from '@/utils/dayScheduleValue';

type PersonalScheduleSlotStatusT = 'POSSIBLE' | 'IMPOSSIBLE';

const toSlotStatus = (
  status: DayScheduleValueT['morning'],
): PersonalScheduleSlotStatusT =>
  status === 'available' ? 'POSSIBLE' : 'IMPOSSIBLE';

export type PatchPersonalScheduleRequestT = {
  value: IndividualScheduleValueT;
  /** 정기 일정 등을 합쳐 계산된 배경값 — 슬롯/uncertain 각각 이 값과 같으면(즉
   * 사용자가 그 필드는 안 건드린 경우) 해당 필드 자체를 생략해서 보낸다.
   * 예: 슬롯만 바뀌면 slots만, uncertain만 바뀌면 uncertain만, 둘 다 바뀌면 둘 다
   * (스펙 시나리오 2/4/6) — 값이 있는 필드만 서버가 갱신하고 나머진 그대로 둔다 */
  mergedStatus: IndividualScheduleValueT;
};

export const patchPersonalSchedule = async ({
  value,
  mergedStatus,
}: PatchPersonalScheduleRequestT): Promise<void> => {
  await request('/api/v1/users/schedule/personal', {
    method: 'PATCH',
    data: {
      // Object.entries의 key는 getDateKey(Date.toDateString())라서, API가 요구하는
      // "yyyy-MM-dd" 형식으로 다시 변환해야 한다.
      items: Object.entries(value).map(([dateKey, day]) => {
        const baseline = mergedStatus[dateKey] ?? DEFAULT_DAY_VALUE;
        const slotsChanged = !areSlotsEqual(day, baseline);
        const uncertainChanged = day.isUncertain !== baseline.isUncertain;

        return {
          scheduleDate: format(new Date(dateKey), 'yyyy-MM-dd'),
          ...(slotsChanged && {
            slots: {
              morningStatus: toSlotStatus(day.morning),
              afternoonStatus: toSlotStatus(day.afternoon),
              eveningStatus: toSlotStatus(day.evening),
            },
          }),
          ...(uncertainChanged && { uncertain: day.isUncertain }),
        };
      }),
    },
  });
};
