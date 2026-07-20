'use client';

import { useState } from 'react';

import CloseIcon from '@/assets/icons/close.svg';
import EditCalendarIcon from '@/assets/icons/edit-calendar.svg';
import ModifyIcon from '@/assets/icons/modify.svg';
import RepeatIcon from '@/assets/icons/repeat.svg';
import FloatingButton from '@/components/floating-button';
import Modal from '@/components/modal';

type CalendarFabMenuProps = {
  onSelectRepeatSchedule: () => void;
  onSelectIndividualSchedule: () => void;
};

function CalendarFabMenu({
  onSelectRepeatSchedule,
  onSelectIndividualSchedule,
}: CalendarFabMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-x-0 top-0 bottom-0 z-20 mx-auto w-full bg-black/25 sm:max-w-90"
        />
      )}
      {open && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full sm:max-w-90">
          <div className="pointer-events-auto absolute right-5 bottom-[138px]">
            <Modal
              items={[
                {
                  label: '반복 일정 수정',
                  icon: <RepeatIcon />,
                  onClick: () => {
                    setOpen(false);
                    onSelectRepeatSchedule();
                  },
                },
                {
                  label: '개별 일정 수정',
                  icon: <EditCalendarIcon />,
                  onClick: () => {
                    setOpen(false);
                    onSelectIndividualSchedule();
                  },
                },
              ]}
            />
          </div>
        </div>
      )}
      <FloatingButton
        color="black"
        aria-label={open ? '일정 수정 메뉴 닫기' : '일정 수정 메뉴 열기'}
        onClick={() => setOpen((prev) => !prev)}
        icon={
          open ? (
            <CloseIcon className="size-8 text-white" />
          ) : (
            <ModifyIcon className="size-8 text-white" />
          )
        }
        className="bottom-[66px]"
      />
    </>
  );
}

export default CalendarFabMenu;
