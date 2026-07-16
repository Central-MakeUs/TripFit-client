'use client';

import { ReactNode } from 'react';
import { Drawer } from 'vaul';

import { bottomSheetContentStyle } from './bottomSheet.style';

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  dismissible?: boolean;
  variant?: 'modal' | 'non-modal';
};

function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  dismissible = true,
  variant = 'modal',
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/25" />
        <Drawer.Content
          onPointerDownOutside={(event) => {
            if (!dismissible) event.preventDefault();
          }}
          className={bottomSheetContentStyle({ variant })}
        >
          <div className="mx-auto mt-3 h-1 w-14 shrink-0 cursor-grab rounded-[99px] bg-grey-100 active:cursor-grabbing" />
          <div className="border-b border-grey-50">
            <Drawer.Title asChild>{title}</Drawer.Title>
          </div>
          <div className="overflow-y-auto overscroll-contain">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default BottomSheet;
