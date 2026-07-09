import {
  ScheduleStatusOption,
  SCHEDULE_STATUS_OPTIONS,
} from './scheduleStatusSelector.const';
import { scheduleStatusOptionStyle } from './scheduleStatusSelector.style';

type ScheduleStatusSelectorProps = {
  value: ScheduleStatusOption;
  onChange: (value: ScheduleStatusOption) => void;
};

function ScheduleStatusSelector({
  value,
  onChange,
}: ScheduleStatusSelectorProps) {
  return (
    <div className="flex w-full gap-3">
      {SCHEDULE_STATUS_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        const Icon = option.Icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={scheduleStatusOptionStyle({ selected: isSelected })}
          >
            <Icon className="h-5 w-5" />
            <span className="text-caption-06 text-grey-800">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ScheduleStatusSelector;
