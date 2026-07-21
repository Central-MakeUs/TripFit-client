'use client';

import { useState } from 'react';
import Image from 'next/image';

import shareSheetBanner from '@/assets/images/share-sheet-banner.png';
import BottomSheet from '@/components/bottom-sheet';
import CtaButtonGroup from '@/components/cta-button-group';
import Input from '@/components/input';
import Textarea from '@/components/textarea';

type ShareSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialTitleValue: string;
  initialDescriptionValue: string;
  onShare: (value: { title: string; description: string }) => void;
};

function ShareSheet({
  open,
  onOpenChange,
  title,
  initialTitleValue,
  initialDescriptionValue,
  onShare,
}: ShareSheetProps) {
  const [titleValue, setTitleValue] = useState(initialTitleValue);
  const [descriptionValue, setDescriptionValue] = useState(
    initialDescriptionValue,
  );

  const handleShare = () => {
    onShare({ title: titleValue, description: descriptionValue });
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      variant="non-modal"
      title={
        <div className="flex flex-col gap-0.5 px-5 py-4">
          <h2 className="text-body-01 text-black">{title}</h2>
          <p className="text-body-06 text-grey-500">
            제목과 설명은 자유롭게 수정할 수 있어요
          </p>
        </div>
      }
    >
      <div className="flex w-full flex-col gap-4 px-4 py-2">
        <div className="relative h-46 w-full overflow-hidden rounded-[20px] bg-blue-50">
          <Image
            src={shareSheetBanner}
            alt=""
            width={328}
            height={328}
            className="pointer-events-none absolute -top-18 left-0 object-cover"
          />
        </div>
        <Input
          label="제목"
          value={titleValue}
          onChange={(event) => setTitleValue(event.target.value)}
        />
        <Textarea
          label="설명"
          value={descriptionValue}
          onChange={(event) => setDescriptionValue(event.target.value)}
        />
      </div>
      <CtaButtonGroup
        primaryText="공유하기"
        primaryColor="secondary"
        onPrimaryClick={handleShare}
        secondaryText="취소"
        secondaryColor="secondary"
        secondaryVariant="button-horizontal"
        onSecondaryClick={() => onOpenChange(false)}
        className="px-3 py-4"
      />
    </BottomSheet>
  );
}

export default ShareSheet;
