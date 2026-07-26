'use client';

import { useState } from 'react';

import AddSIcon from '@/assets/icons/add-s.svg';
import ArrowLeftIcon from '@/assets/icons/arrow-left-200.svg';
import MoreVertIcon from '@/assets/icons/more-vert.svg';
import BottomSheet from '@/components/bottom-sheet';
import Button from '@/components/button';
import CtaButtonGroup from '@/components/cta-button-group';
import DaySelector from '@/components/day-selector';
import IconButton from '@/components/icon-button';
import Modal from '@/components/modal';
import { RegularScheduleT } from '@/types/schedule';
import { cn } from '@/utils/cn';

import TimePicker from './TimePicker';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const DEFAULT_TIME = '09:00';

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

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null,
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
    setEditingScheduleId(null);
    setActiveTimeField(null);
    setIsAddSheetOpen(true);
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (schedule: RegularScheduleT) => {
    setDraftDays(schedule.days);
    setDraftStartTime(schedule.startTime);
    setDraftEndTime(schedule.endTime);
    setEditingScheduleId(schedule.id);
    setOpenMenuId(null);
    setActiveTimeField(null);
    setIsAddSheetOpen(true);
    setIsSheetOpen(true);
  };

  const handleSaveSchedule = () => {
    if (editingScheduleId) {
      onChange(
        value.map((schedule) =>
          schedule.id === editingScheduleId
            ? {
                ...schedule,
                days: draftDays,
                startTime: draftStartTime,
                endTime: draftEndTime,
              }
            : schedule,
        ),
      );
    } else {
      onChange([
        ...value,
        {
          id: crypto.randomUUID(),
          days: draftDays,
          startTime: draftStartTime,
          endTime: draftEndTime,
        },
      ]);
    }
    resetDraft();
    setEditingScheduleId(null);
    setIsAddSheetOpen(false);
    setIsSheetOpen(false);
  };

  const handleRemoveSchedule = (id: string) => {
    onChange(value.filter((schedule) => schedule.id !== id));
    setOpenMenuId(null);
  };

  const isAddDisabled =
    draftDays.length === 0 || !draftStartTime || !draftEndTime;

  const draftTimeByField = { start: draftStartTime, end: draftEndTime };

  const setDraftTimeByField = (field: 'start' | 'end', time: string) => {
    if (field === 'start') setDraftStartTime(time);
    else setDraftEndTime(time);
  };

  const handleOpenTimeSheet = (field: 'start' | 'end') => {
    setPendingTime(draftTimeByField[field] || DEFAULT_TIME);
    setActiveTimeField(field);
    setIsSheetOpen(true);
  };

  // isAddSheetOpen/activeTimeField(어떤 화면을 보여줄지)는 여기서 건드리지 않는다 —
  // 닫히는 애니메이션 도중 내용이 TimePicker에서 폼으로 바뀌어 보이는(깜빡임) 문제가 생긴다.
  // 다음에 새로 열 때(handleOpenAddSheet/handleOpenEditSheet/handleOpenTimeSheet)만 초기화한다.
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
  };

  const handleConfirmTime = () => {
    if (activeTimeField) {
      setDraftTimeByField(activeTimeField, pendingTime);
    }
    setActiveTimeField(null);
    // 폼 시트를 거치지 않고 바로 연 경우(인라인)는 돌아갈 화면이 없으므로 시트 자체를 닫는다
    if (!isAddSheetOpen) {
      setIsSheetOpen(false);
    }
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
                'flex w-full cursor-pointer items-center justify-between p-4',
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
                  aria-label="일정 메뉴 열기"
                  onClick={() =>
                    setOpenMenuId((prev) =>
                      prev === schedule.id ? null : schedule.id,
                    )
                  }
                  className="absolute top-1.5 right-1.5"
                />
                {openMenuId === schedule.id && (
                  <>
                    <div
                      aria-hidden
                      onClick={() => setOpenMenuId(null)}
                      className="fixed inset-0 z-10"
                    />
                    <Modal
                      className="absolute top-8 right-1.5 z-20"
                      items={[
                        {
                          label: '수정하기',
                          onClick: () => handleOpenEditSheet(schedule),
                        },
                        {
                          label: '삭제하기',
                          variant: 'destructive',
                          onClick: () => handleRemoveSchedule(schedule.id),
                        },
                      ]}
                    />
                  </>
                )}
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
        onPrimaryClick={hasSchedules ? onNext : handleSaveSchedule}
        secondaryText={onSkip ? '건너뛰기' : undefined}
        secondaryVariant="text-link"
        secondaryIcon={false}
        onSecondaryClick={onSkip}
        className="mt-auto px-0"
      />

      <BottomSheet
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        title={
          activeTimeField ? (
            isAddSheetOpen ? (
              <div className="flex w-full items-center gap-1 py-3 pr-5 pl-2">
                <IconButton
                  size="small"
                  icon={<ArrowLeftIcon className="text-grey-500" />}
                  onClick={() => setActiveTimeField(null)}
                  aria-label="뒤로가기"
                />
                <span className="text-body-01 text-black">
                  {activeTimeField === 'start' ? '출근 시간' : '퇴근 시간'}
                </span>
              </div>
            ) : (
              <span className="text-body-01 block p-4">
                {activeTimeField === 'start' ? '출근 시간' : '퇴근 시간'}
              </span>
            )
          ) : (
            <span className="text-body-01 block p-4">
              {editingScheduleId ? '기본 일정 수정하기' : '기본 일정 추가하기'}
            </span>
          )
        }
        variant="non-modal"
      >
        {activeTimeField ? (
          <>
            <div
              className={cn(
                'flex flex-col items-center justify-center px-5',
                // 추가하기를 거쳐 열렸을 땐 뒤 폼 시트와 높이를 맞춰서 전환 시 시트 크기가 튀지 않게 한다
                isAddSheetOpen ? 'h-80' : 'h-56',
              )}
            >
              <TimePicker value={pendingTime} onChange={setPendingTime} />
            </div>
            <div className="px-5 pt-2 pb-4">
              <CtaButtonGroup
                primaryText="저장하기"
                primaryColor="secondary"
                onPrimaryClick={handleConfirmTime}
                className="px-0"
              />
            </div>
          </>
        ) : (
          <>
            <div className="p-5">{draftForm}</div>
            <div className="px-5 pt-2 pb-4">
              <CtaButtonGroup
                primaryText={editingScheduleId ? '수정하기' : '추가하기'}
                primaryColor="secondary"
                primaryDisabled={isAddDisabled}
                onPrimaryClick={handleSaveSchedule}
                className="px-0"
              />
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}

export default RegularScheduleDetailStep;
