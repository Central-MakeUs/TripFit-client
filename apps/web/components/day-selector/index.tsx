import { cn } from '@/utils/cn';

import { dayItemStyle } from './daySelector.style';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

type DaySelectorProps = {
  className?: string;
  onChange: (selected: number[]) => void;
  selected: number[];
};

function DaySelector({ className, onChange, selected }: DaySelectorProps) {
  const handleToggle = (day: number) => {
    onChange(
      selected.includes(day)
        ? selected.filter((item) => item !== day)
        : [...selected, day],
    );
  };

  return (
    <div className={cn('flex w-full items-center gap-1', className)}>
      {DAYS.map((label, day) => (
        <button
          key={label}
          type="button"
          onClick={() => handleToggle(day)}
          className={dayItemStyle({ selected: selected.includes(day) })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default DaySelector;
