'use client';

import { useState } from 'react';

import BottomSheet from '@/components/bottom-sheet';

function BottomSheetPreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-body-05 cursor-pointer rounded-lg border border-grey-200 px-4 py-2"
      >
        바텀시트 열기
      </button>
      <BottomSheet open={open} onOpenChange={setOpen} title="여행방 초대하기">
        <p>아래로 드래그하거나 배경을 눌러서 닫을 수 있어요.</p>
        <p>아래로 드래그하거나 배경을 눌러서 닫을 수 있어요.</p>
        <p>아래로 드래그하거나 배경을 눌러서 닫을 수 있어요.</p>
        <p>아래로 드래그하거나 배경을 눌러서 닫을 수 있어요.</p>
      </BottomSheet>
    </>
  );
}

export default BottomSheetPreview;
