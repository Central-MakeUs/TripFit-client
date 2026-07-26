import Roulette from '@/components/roulette';

const PERIODS = ['오전', '오후'];
const HOURS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, '0'),
);
const MINUTES = ['00', '30'];

const WHEEL_PROPS = {
  flat: true,
  itemHeight: 36,
  fontSize: 22,
  centerFontSize: 24,
};

const to24Hour = (period: string, hour12: string, minute: string) => {
  const hour = Number(hour12) % 12;
  const hour24 = period === '오후' ? hour + 12 : hour;
  return `${String(hour24).padStart(2, '0')}:${minute}`;
};

const MINUTES_PER_DAY = 24 * 60;

const from24Hour = (value: string) => {
  const [hourPart = '9', minutePart = '0'] = value.split(':');
  // 분을 30분 단위로 반올림할 때 60을 넘기면 시(그리고 필요하면 오전/오후)까지 함께 넘어가야 하므로,
  // 하루 전체를 분 단위로 환산해 반올림한 뒤 다시 시/분으로 쪼갠다 (자정 넘어가는 경우도 24시간으로 순환)
  const totalMinutes = Number(hourPart) * 60 + Number(minutePart);
  const roundedTotalMinutes =
    (((Math.round(totalMinutes / 30) * 30) % MINUTES_PER_DAY) +
      MINUTES_PER_DAY) %
    MINUTES_PER_DAY;
  const hour24 = Math.floor(roundedTotalMinutes / 60);
  const minute = roundedTotalMinutes % 60;
  const period = hour24 < 12 ? '오전' : '오후';
  const hour12 = String(hour24 % 12 === 0 ? 12 : hour24 % 12).padStart(2, '0');
  const roundedMinute = String(minute).padStart(2, '0');
  return { period, hour12, minute: roundedMinute };
};

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function TimePicker({ value, onChange }: TimePickerProps) {
  const { period, hour12, minute } = from24Hour(value);

  return (
    <div className="relative flex w-full items-center justify-center gap-14 px-5 py-1">
      <div
        aria-hidden
        className="absolute inset-x-5 top-1/2 h-11 -translate-y-1/2 rounded-xl bg-grey-50"
      />
      <Roulette
        {...WHEEL_PROPS}
        className="w-14"
        value={period}
        values={PERIODS}
        onChange={(nextPeriod) =>
          onChange(to24Hour(nextPeriod, hour12, minute))
        }
      />
      <Roulette
        {...WHEEL_PROPS}
        className="w-9"
        value={hour12}
        values={HOURS}
        onChange={(nextHour) => onChange(to24Hour(period, nextHour, minute))}
      />
      <Roulette
        {...WHEEL_PROPS}
        className="w-9"
        value={minute}
        values={MINUTES}
        onChange={(nextMinute) =>
          onChange(to24Hour(period, hour12, nextMinute))
        }
      />
    </div>
  );
}

export default TimePicker;
