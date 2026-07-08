'use client';

import { ReactNode } from 'react';
import { Drawer } from 'vaul';

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
};

function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/25" />
        <Drawer.Content
          onPointerDownOutside={(event) => event.preventDefault()}
          className="fixed right-2 bottom-8.5 left-2 pb-3 flex max-h-[90vh] flex-col overflow-hidden rounded-4xl bg-white shadow-[0_16px_60px_0_rgba(0,0,0,0.12),0_12px_20px_0_rgba(0,0,0,0.08),0_2px_8px_0_rgba(0,0,0,0.12)]"
        >
          <div className="mx-auto mt-3 h-1 w-14 shrink-0 cursor-grab rounded-[99px] bg-grey-100 active:cursor-grabbing" />
          <div className="border-b border-grey-50 px-4 py-3">
            <Drawer.Title className="text-body-01">{title}</Drawer.Title>
          </div>
          <div className="overflow-y-auto">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default BottomSheet;
