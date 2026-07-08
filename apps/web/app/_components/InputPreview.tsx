'use client';

import { useState } from 'react';

import Input from '@/components/input';

function InputPreview() {
  const [value, setValue] = useState('');

  return (
    <div className="flex w-full flex-col gap-6">
      <Input
        label="여행 제목"
        placeholder="여행 제목을 입력해주세요"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Input
        placeholder="검색어를 입력해주세요"
        suffixSlot={
          <button type="button" aria-label="지우기" className="cursor-pointer">
            X
          </button>
        }
      />
      <Input
        label="여행 기간"
        placeholder="기간을 선택해주세요"
        readOnly
        prefixSlot={<span aria-hidden>📅</span>}
      />
      <Input
        label="이메일"
        placeholder="이메일을 입력해주세요"
        errorMessage="올바른 이메일 형식이 아니에요"
      />
      <Input label="비활성 필드" placeholder="입력할 수 없어요" disabled />
    </div>
  );
}

export default InputPreview;
