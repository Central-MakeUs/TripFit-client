'use client';

import { useState } from 'react';

import BottomSheet from '@/components/bottom-sheet';
import BottomSheetListItem from '@/components/bottom-sheet-list-item';

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
      <BottomSheet open={open} onOpenChange={setOpen} title="여행방 관리">
        <div className="grid grid-cols-2 gap-2">
          <BottomSheetListItem selected={false}>
            default (미선택)
          </BottomSheetListItem>
          <BottomSheetListItem selected>default (선택)</BottomSheetListItem>
          <BottomSheetListItem category="red" selected={false}>
            Red (미선택)
          </BottomSheetListItem>
          <BottomSheetListItem category="red" selected>
            Red (선택)
          </BottomSheetListItem>
        </div>
      </BottomSheet>
    </>
  );
}

export default BottomSheetPreview;
