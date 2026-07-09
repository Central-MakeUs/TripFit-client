'use client';

import { useState } from 'react';

import CalendarMonthIcon from '@/assets/icons/calendar-month.svg';
import CloseCircleIcon from '@/assets/icons/colse-circle.svg';
import Input from '@/components/input';

function InputPreview() {
  const [value, setValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [numValue, setNumValue] = useState('');

  return (
    <div className="flex w-full flex-col gap-6">
      <Input
        label="여행 제목"
        placeholder="(라벨 O) 여행 제목을 입력해주세요"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        suffixSlot={
          value && (
            <button
              type="button"
              aria-label="지우기"
              className="cursor-pointer"
              onClick={() => setValue('')}
            >
              <CloseCircleIcon className="h-3 w-3" />
            </button>
          )
        }
      />
      <Input
        placeholder="(라벨 x) 검색어를 입력해주세요"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        suffixSlot={
          searchValue && (
            <button
              type="button"
              aria-label="지우기"
              className="cursor-pointer"
              onClick={() => setSearchValue('')}
            >
              <CloseCircleIcon className="h-3 w-3" />
            </button>
          )
        }
      />
      <Input
        value={numValue}
        onChange={(event) => setNumValue(event.target.value)}
        suffixSlot={<span>박</span>}
      />
      <Input
        label="여행 기간"
        placeholder="기간을 선택해주세요"
        prefixSlot={<CalendarMonthIcon className="h-4 w-4 text-grey-200" />}
      />
      <Input
        label="이메일"
        value="abc@mail.com"
        readOnly
        placeholder="이메일을 입력해주세요"
        message="이메일 형식이 맞습니다."
      />
      <Input
        label="이메일"
        value="abc#mail.com"
        readOnly
        placeholder="이메일을 입력해주세요"
        message="올바른 이메일 형식이 아니에요."
        error
      />
      <Input label="비활성 필드" placeholder="입력할 수 없어요" disabled />
    </div>
  );
}

export default InputPreview;
