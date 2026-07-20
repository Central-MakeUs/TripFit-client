'use client';

import { useState } from 'react';

import AddSIcon from '@/assets/icons/add-s.svg';
import MoreVertIcon from '@/assets/icons/more-vert.svg';
import BottomSheet from '@/components/bottom-sheet';
import Button from '@/components/button';
import CtaButtonGroup from '@/components/cta-button-group';
import DaySelector from '@/components/day-selector';
import IconButton from '@/components/icon-button';
import { RegularScheduleT } from '@/types/schedule';
import { cn } from '@/utils/cn';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const TIME_FIELDS = [
  { field: 'start' as const, label: '출근' },
  { field: 'end' as const, label: '퇴근' },
];

const formatDays = (days: number[]) =>
  [...days]
    .sort((a, b) => a - b)
    .map((day) => DAY_LABELS[day])
    .join(', ');

type RegularScheduleDetailStepProps = {
  value: RegularScheduleT[];
  onChange: (value: RegularScheduleT[]) => void;
  onNext: () => void;
  onSkip?: () => void;
};

function RegularScheduleDetailStep({
  value,
  onChange,
  onNext,
  onSkip,
}: RegularScheduleDetailStepProps) {
  const hasSchedules = value.length > 0;

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [draftDays, setDraftDays] = useState<number[]>([]);
  const [draftStartTime, setDraftStartTime] = useState('');
  const [draftEndTime, setDraftEndTime] = useState('');
  const [activeTimeField, setActiveTimeField] = useState<
    'start' | 'end' | null
  >(null);
  const [pendingTime, setPendingTime] = useState('');

  const resetDraft = () => {
    setDraftDays([]);
    setDraftStartTime('');
    setDraftEndTime('');
  };

  const handleOpenAddSheet = () => {
    resetDraft();
    setIsAddSheetOpen(true);
  };

  const handleAddSchedule = () => {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        days: draftDays,
        startTime: draftStartTime,
        endTime: draftEndTime,
      },
    ]);
    resetDraft();
    setIsAddSheetOpen(false);
  };

  const handleRemoveSchedule = (id: string) => {
    onChange(value.filter((schedule) => schedule.id !== id));
  };

  const isAddDisabled =
    draftDays.length === 0 || !draftStartTime || !draftEndTime;

  const draftTimeByField = { start: draftStartTime, end: draftEndTime };

  const setDraftTimeByField = (field: 'start' | 'end', time: string) => {
    if (field === 'start') setDraftStartTime(time);
    else setDraftEndTime(time);
  };

  const handleOpenTimeSheet = (field: 'start' | 'end') => {
    setPendingTime(draftTimeByField[field]);
    setActiveTimeField(field);
  };

  const handleTimeSheetOpenChange = (open: boolean) => {
    if (!open) setActiveTimeField(null);
  };

  const handleConfirmTime = () => {
    if (activeTimeField) {
      setDraftTimeByField(activeTimeField, pendingTime);
    }
    setActiveTimeField(null);
  };

  const draftForm = (
    <div className="flex flex-col gap-12">
      <div>
        <span className="text-body-05 text-grey-800 mb-2 block">출근 요일</span>
        <DaySelector selected={draftDays} onChange={setDraftDays} />
      </div>
      <div>
        <span className="text-body-05 text-grey-800 mb-2 block">
          출퇴근 시간
        </span>
        <div className="rounded-2xl bg-grey-20">
          {TIME_FIELDS.map(({ field, label }, index) => (
            <button
              key={field}
              type="button"
              onClick={() => handleOpenTimeSheet(field)}
              className={cn(
                'flex w-full items-center justify-between p-4',
                index < TIME_FIELDS.length - 1 &&
                  'border-b border-[rgba(232,233,235,0.80)]',
              )}
            >
              <span className="text-body-05 text-grey-500">{label}</span>
              <span
                className={cn(
                  'text-body-05',
                  draftTimeByField[field] ? 'text-grey-800' : 'text-grey-300',
                )}
              >
                {draftTimeByField[field] || '00:00'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-body-01 mt-3 mb-0.5">
        출근, 수업, 회의 등 <br />
        매주 반복되는 일정을 알려주세요
      </h2>
      <p className="text-caption-01 text-grey-400 mb-13">
        입력한 요일은 피해서 추천할게요
      </p>

      {hasSchedules ? (
        <>
          <ul className="flex flex-col gap-2 mb-2">
            {value.map((schedule) => (
              <li
                key={schedule.id}
                className="relative rounded-xl border border-grey-100 p-4"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-03 text-grey-800">
                    {formatDays(schedule.days)}
                  </span>
                  <span className="text-body-06 text-grey-500">
                    {schedule.startTime} - {schedule.endTime} 근무
                  </span>
                </div>
                <IconButton
                  icon={<MoreVertIcon className="text-grey-400" />}
                  aria-label="일정 삭제"
                  onClick={() => handleRemoveSchedule(schedule.id)}
                  className="absolute top-1.5 right-1.5"
                />
              </li>
            ))}
          </ul>

          <Button
            text="추가하기"
            style="weak"
            type="secondary"
            icon={<AddSIcon className="size-6 text-grey-600" />}
            onClick={handleOpenAddSheet}
            className="w-full"
          />
        </>
      ) : (
        draftForm
      )}

      <CtaButtonGroup
        primaryText={hasSchedules ? '다음' : '추가하기'}
        primaryColor="secondary"
        primaryDisabled={hasSchedules ? false : isAddDisabled}
        onPrimaryClick={hasSchedules ? onNext : handleAddSchedule}
        secondaryText={onSkip ? '건너뛰기' : undefined}
        secondaryVariant="text-link"
        secondaryIcon={false}
        onSecondaryClick={onSkip}
        className="mt-auto px-0"
      />

      {hasSchedules && (
        <BottomSheet
          open={isAddSheetOpen}
          onOpenChange={setIsAddSheetOpen}
          title={
            <span className="text-body-01 block p-4">기본 일정 추가하기</span>
          }
          variant="non-modal"
        >
          <div className="p-5">{draftForm}</div>
          <div className="px-5 pt-2 pb-4">
            <CtaButtonGroup
              primaryText="추가하기"
              primaryColor="secondary"
              primaryDisabled={isAddDisabled}
              onPrimaryClick={handleAddSchedule}
              className="px-0"
            />
          </div>
        </BottomSheet>
      )}

      <BottomSheet
        open={activeTimeField !== null}
        onOpenChange={handleTimeSheetOpenChange}
        title={
          <span className="text-body-01 block px-4 py-3">
            {activeTimeField === 'start' ? '출근 시간' : '퇴근 시간'}
          </span>
        }
        variant="non-modal"
      >
        <div className="p-5">
          {/* TODO: 팀원이 만들 타임피커(오전/오후, 시, 분)로 교체 예정 */}
          <input
            type="time"
            value={pendingTime}
            onChange={(event) => setPendingTime(event.target.value)}
            className="w-full rounded-xl border border-grey-100 p-3"
          />
        </div>
        <div className="px-5 pt-2 pb-4">
          <CtaButtonGroup
            primaryText="확인"
            primaryColor="secondary"
            onPrimaryClick={handleConfirmTime}
            className="px-0"
          />
        </div>
      </BottomSheet>
    </div>
  );
}

export default RegularScheduleDetailStep;
