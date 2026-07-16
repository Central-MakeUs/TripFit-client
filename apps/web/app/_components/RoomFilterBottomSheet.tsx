'use client';

import BottomSheet from '@/components/bottom-sheet';
import BottomSheetListItem from '@/components/bottom-sheet-list-item';
import Checkbox from '@/components/checkbox';

import { FILTER_OPTIONS, RoomFilterT } from '../_consts/room.const';

type RoomFilterBottomSheetProps = {
  filter: RoomFilterT;
  onFilterChange: (filter: RoomFilterT) => void;
  onlyMine: boolean;
  onOnlyMineChange: (onlyMine: boolean) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function RoomFilterBottomSheet({
  filter,
  onFilterChange,
  onlyMine,
  onOnlyMineChange,
  onOpenChange,
  open,
}: RoomFilterBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={<div className="text-body-01 px-4 py-3">필터</div>}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOnlyMineChange(!onlyMine)}
        className="flex cursor-pointer items-center pt-2 pr-4 pb-1 pl-1"
      >
        <Checkbox checked={onlyMine} className="-mr-1" />
        <p className="text-body-06 text-grey-800">내가 생성한 방만 보기</p>
      </div>
      <div className="flex flex-col gap-1 px-1 pb-3">
        {FILTER_OPTIONS.map((option) => (
          <BottomSheetListItem
            key={option.value}
            selected={filter === option.value}
            onClick={() => {
              onFilterChange(option.value);
              onOpenChange(false);
            }}
          >
            {option.label}
          </BottomSheetListItem>
        ))}
      </div>
    </BottomSheet>
  );
}

export default RoomFilterBottomSheet;
