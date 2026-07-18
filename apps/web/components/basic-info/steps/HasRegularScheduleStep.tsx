import BusinessCenterIcon from '@/assets/icons/business-center.svg';
import EditCalendarIcon from '@/assets/icons/edit-calendar.svg';
import TextButton from '@/components/text-button';
import { cn } from '@/utils/cn';

type HasRegularScheduleStepProps = {
  value: boolean | null;
  onNext: (hasRegularSchedule: boolean) => void;
  onSkip?: () => void;
};

function HasRegularScheduleStep({
  value,
  onNext,
  onSkip,
}: HasRegularScheduleStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">정기적인 일정이 있나요?</h2>
      <p className="text-caption-01 text-grey-400 pb-13">
        출근이나 수업으로 비어있지 않은 요일이 있는지 알려주세요
      </p>
      <div role="radiogroup" className="flex flex-col gap-2 py-8">
        <button
          type="button"
          role="radio"
          aria-checked={value === true}
          onClick={() => onNext(true)}
          className={cn(
            'flex items-center cursor-pointer rounded-2xl border-[1.2px] border-transparent bg-grey-50 px-3 py-4 gap-3 transition-colors active:border-blue-200 active:bg-blue-20',
            value === true ? 'border border-blue-200 bg-blue-20' : '',
          )}
        >
          <BusinessCenterIcon className="size-9 text-blue-500" />
          <div className="flex flex-col text-left">
            <span className="text-body-03">네, 있어요</span>
            <span className="text-caption-03 text-grey-500">
              입력한 요일은 피해서 추천할게요
            </span>
          </div>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === false}
          onClick={() => onNext(false)}
          className={cn(
            'flex items-center cursor-pointer rounded-2xl border-[1.2px] border-transparent bg-grey-50 px-3 py-4 gap-3 transition-colors active:border-blue-200 active:bg-blue-20',
            value === false ? 'border border-blue-200 bg-blue-20' : '',
          )}
        >
          <EditCalendarIcon className="size-9 text-blue-500" />
          <div className="flex flex-col text-left">
            <span className="text-body-03">아니요, 없어요</span>
            <span className="text-caption-03 text-grey-500">
              여행 불가능한 날짜를 직접 입력할게요
            </span>
          </div>
        </button>
      </div>
      {onSkip && (
        <TextButton
          text="건너뛰기"
          onClick={onSkip}
          className="mx-auto mt-auto w-fit p-4 mb-0.5"
          icon={<></>}
        />
      )}
    </div>
  );
}

export default HasRegularScheduleStep;
