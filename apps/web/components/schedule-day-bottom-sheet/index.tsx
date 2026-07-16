import { ReactNode } from 'react';

import AfternoonIcon from '@/assets/icons/afternoon.svg';
import DinnerIcon from '@/assets/icons/dinner-1.svg';
import EventNoteIcon from '@/assets/icons/event-note.svg';
import MorningIcon from '@/assets/icons/morning.svg';
import TravelIcon from '@/assets/icons/travel.svg';
import BottomSheet from '@/components/bottom-sheet';
import Button from '@/components/button';
import { cn } from '@/utils/cn';
import { DayScheduleValueT } from '@/types/schedule';

const TIME_SEGMENTS = [
  {
    key: 'morning',
    label: '아침',
    icon: MorningIcon,
    iconColor: 'text-[#FFBA51]',
  },
  {
    key: 'afternoon',
    label: '오후',
    icon: AfternoonIcon,
    iconColor: 'text-orange-400',
  },
  {
    key: 'evening',
    label: '저녁',
    icon: DinnerIcon,
    iconColor: 'text-purple-300',
  },
] as const;

type ScheduleDayBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  value: DayScheduleValueT;
  onChange: (value: DayScheduleValueT) => void;
  onSubmit: () => void;
};

function ScheduleDayBottomSheet({
  open,
  onOpenChange,
  title,
  value,
  onChange,
  onSubmit,
}: ScheduleDayBottomSheetProps) {
  const handleToggleSegment = (key: (typeof TIME_SEGMENTS)[number]['key']) => {
    onChange({
      ...value,
      [key]: value[key] === 'available' ? 'unavailable' : 'available',
    });
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex items-center justify-between px-5 py-2.5">
        <span className="text-body-06 text-grey-600">
          이 날 일정이 변경될 수 있어요
        </span>
        {/* TODO: Toggle 컴포넌트 연동 */}
        <button
          type="button"
          onClick={() =>
            onChange({ ...value, isUncertain: !value.isUncertain })
          }
          className={cn(
            'h-6 w-10 rounded-full transition-colors',
            value.isUncertain ? 'bg-blue-500' : 'bg-grey-200',
          )}
          aria-label="미정 상태 토글"
        />
      </div>
      <div className="flex flex-col gap-1 px-5 py-2">
        {TIME_SEGMENTS.map(({ key, label, icon: SegmentIcon, iconColor }) => {
          const isUnavailable = value[key] === 'unavailable';
          return (
            <div key={key} className="flex gap-5">
              <div className="flex flex-col items-center gap-1">
                <SegmentIcon className={cn('size-7', iconColor)} />
                <span className="text-caption-01 text-grey-700">{label}</span>
              </div>
              <button
                type="button"
                disabled={value.isUncertain}
                onClick={() => handleToggleSegment(key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-2xl p-3 cursor-pointer',
                  isUnavailable
                    ? 'bg-red-300 text-red-20'
                    : 'bg-grey-50 text-grey-400',
                  value.isUncertain &&
                    'cursor-not-allowed bg-grey-100 text-grey-200',
                )}
              >
                <span className="text-body-05">
                  {isUnavailable ? '일정이 있어요' : '여행 가능해요'}
                </span>
                {isUnavailable ? (
                  <EventNoteIcon
                    className={cn(
                      'size-5',
                      value.isUncertain ? 'text-grey-200' : 'text-red-100',
                    )}
                  />
                ) : (
                  <TravelIcon className="size-5 text-grey-200" />
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-4">
        <Button
          text="입력하기"
          type="secondary"
          onClick={onSubmit}
          className="w-full"
        />
      </div>
    </BottomSheet>
  );
}

export default ScheduleDayBottomSheet;
