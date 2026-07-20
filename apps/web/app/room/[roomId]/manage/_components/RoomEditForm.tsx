'use client';

import { useState } from 'react';
import { format } from 'date-fns';

import Checkbox from '@/components/checkbox';
import CtaButtonGroup from '@/components/cta-button-group';
import Input from '@/components/input';
import { RoomT } from '@/types/room';

type RoomEditFormProps = {
  room: RoomT;
  onSave: (value: {
    title: string;
    nights: string;
    days: string;
    isDurationUndecided: boolean;
    destination: string;
    isDestinationUndecided: boolean;
  }) => void;
};

const NAME_MAX_LENGTH = 15;
const DESTINATION_MAX_LENGTH = 15;

const toDigitsOnly = (value: string) => value.replace(/\D/g, '');

function RoomEditForm({ room, onSave }: RoomEditFormProps) {
  const [title, setTitle] = useState(room.title);
  const [nights, setNights] = useState(String(room.nights));
  const [days, setDays] = useState(String(room.days));
  const [isDurationUndecided, setIsDurationUndecided] = useState(false);
  const [destination, setDestination] = useState(room.destination);
  const [isDestinationUndecided, setIsDestinationUndecided] = useState(
    !room.destination,
  );

  const startDate = new Date(room.startDate);
  const endDate = new Date(room.endDate);

  const handleToggleDurationUndecided = (checked: boolean) => {
    setIsDurationUndecided(checked);
    if (checked) {
      setNights('');
      setDays('');
    }
  };

  const handleToggleDestinationUndecided = (checked: boolean) => {
    setIsDestinationUndecided(checked);
    if (checked) setDestination('');
  };

  const handleSave = () => {
    onSave({
      title,
      nights,
      days,
      isDurationUndecided,
      destination,
      isDestinationUndecided,
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col px-5 pt-5 pb-5">
      <div className="flex flex-col gap-9">
        <Input
          label="여행방 이름"
          maxLength={NAME_MAX_LENGTH}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <span className="text-body-05 text-grey-800">여행 기간</span>
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1">
              <Input value={format(startDate, 'yy.MM.dd')} disabled />
            </div>
            <div className="h-[1.5px] w-1.5 shrink-0 bg-grey-200" />
            <div className="min-w-0 flex-1">
              <Input value={format(endDate, 'yy.MM.dd')} disabled />
            </div>
          </div>
          <span className="text-caption-02 text-grey-400">
            여행 기간은 수정할 수 없어요
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-body-05 text-grey-800">여행 일정</span>
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1">
              <Input
                type="text"
                inputMode="numeric"
                disabled={isDurationUndecided}
                value={nights}
                onChange={(event) =>
                  setNights(toDigitsOnly(event.target.value))
                }
                suffixSlot={
                  <span className="text-body-03 text-grey-300">박</span>
                }
              />
            </div>
            <div className="h-[1.5px] w-1.5 shrink-0 bg-grey-200" />
            <div className="min-w-0 flex-1">
              <Input
                type="text"
                inputMode="numeric"
                disabled={isDurationUndecided}
                value={days}
                onChange={(event) => setDays(toDigitsOnly(event.target.value))}
                suffixSlot={
                  <span className="text-body-03 text-grey-300">일</span>
                }
              />
            </div>
          </div>
          <label className="flex w-fit items-center gap-2">
            <Checkbox
              checked={isDurationUndecided}
              onCheckedChange={handleToggleDurationUndecided}
            />
            <span className="text-body-06 text-grey-700">아직 못정했어요</span>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            label="여행지"
            placeholder="여행지를 입력해 주세요"
            maxLength={DESTINATION_MAX_LENGTH}
            disabled={isDestinationUndecided}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
          <label className="flex w-fit items-center gap-2">
            <Checkbox
              checked={isDestinationUndecided}
              onCheckedChange={handleToggleDestinationUndecided}
            />
            <span className="text-body-06 text-grey-700">아직 못정했어요</span>
          </label>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full rounded-t-xl bg-white/80 backdrop-blur-[18px] sm:max-w-90">
        <CtaButtonGroup
          primaryText="저장하기"
          primaryColor="secondary"
          primaryDisabled={!title}
          onPrimaryClick={handleSave}
        />
      </div>
      <div aria-hidden className="h-[58px] w-full shrink-0" />
    </div>
  );
}

export default RoomEditForm;
