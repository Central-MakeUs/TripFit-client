import { parseISO } from 'date-fns';

import { getDateKey } from '@/components/schedule-calendar/scheduleCalendar.const';
import {
  ScheduleCalendarDayT,
  ScheduleSlotStatusT,
} from '@/apis/getScheduleCalendar';
import { DaySegmentStatusT, IndividualScheduleValueT } from '@/types/schedule';

const fromSlotStatus = (status: ScheduleSlotStatusT): DaySegmentStatusT =>
  status === 'POSSIBLE' ? 'available' : 'unavailable';

// API의 date는 "yyyy-MM-dd"지만 ScheduleCalendar 내부 값(IndividualScheduleValueT)의
// key는 getDateKey(Date.toDateString())를 쓰므로, 여기서 반드시 변환해야 캘린더 UI가
// 해당 날짜의 값을 올바르게 찾아 표시한다. new Date("yyyy-MM-dd")는 UTC 자정으로
// 해석되어 로컬 타임존에 따라 하루가 밀릴 수 있으므로, 로컬 기준으로 해석하는
// parseISO를 사용한다.
export const mapScheduleCalendarToIndividualScheduleValue = (
  days: ScheduleCalendarDayT[],
): IndividualScheduleValueT =>
  Object.fromEntries(
    days.map((day) => [
      getDateKey(parseISO(day.date)),
      {
        isUncertain: day.uncertain,
        morning: fromSlotStatus(day.morningStatus),
        afternoon: fromSlotStatus(day.afternoonStatus),
        evening: fromSlotStatus(day.eveningStatus),
      },
    ]),
  );
