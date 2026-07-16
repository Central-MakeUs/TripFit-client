'use client';

import { ReactNode } from 'react';
import { Drawer } from 'vaul';

import CloseIcon from '@/assets/icons/close.svg';
import IconButton from '@/components/icon-button';
import { cn } from '@/utils/cn';

import { bottomSheetContentStyle } from './bottomSheet.style';

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  dismissible?: boolean;
  variant?: 'modal' | 'non-modal';
  dismissType?: 'handle' | 'close-button';
};

function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  dismissible = true,
  variant = 'modal',
  dismissType = 'handle',
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-x-0 top-0 bottom-0 z-50 mx-auto w-full bg-black/25 sm:max-w-90" />
        <Drawer.Content
          onPointerDownOutside={(event) => {
            if (!dismissible) {
              event.preventDefault();
              return;
            }
            // 오버레이가 폰 너비 컬럼(sm:max-w-90=360px)에만 딤 처리되므로,
            // 그 바깥의 회색 여백을 눌렀을 때는 바텀시트가 닫히지 않게 한다.
            const { clientX } = event.detail.originalEvent;
            const columnWidth = Math.min(360, window.innerWidth);
            const left = (window.innerWidth - columnWidth) / 2;
            if (clientX < left || clientX > left + columnWidth) {
              event.preventDefault();
            }
          }}
          className={bottomSheetContentStyle({ variant })}
        >
          {dismissType === 'handle' ? (
            <div className="mx-auto mt-2 h-1 w-14 shrink-0 cursor-grab rounded-[99px] bg-grey-100 active:cursor-grabbing" />
          ) : (
            <IconButton
              size="small"
              icon={<CloseIcon className="text-grey-500" />}
              onClick={() => onOpenChange(false)}
              aria-label="닫기"
              className="absolute top-1 right-2.5 z-10"
            />
          )}
          <div
            className={cn(
              'border-b border-grey-50',
              dismissType === 'close-button' && 'pt-7',
            )}
          >
            <Drawer.Title asChild>{title}</Drawer.Title>
          </div>
          <div className="overflow-y-auto overscroll-contain">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default BottomSheet;
