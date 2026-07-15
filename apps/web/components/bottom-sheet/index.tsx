'use client';

import { ReactNode } from 'react';
import { Drawer } from 'vaul';

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  dismissible?: boolean;
};

function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  dismissible = true,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/25" />
        <Drawer.Content
          onPointerDownOutside={(event) => {
            if (!dismissible) event.preventDefault();
          }}
          className="fixed inset-x-2 bottom-8.5 flex max-h-[90vh] flex-col overflow-hidden rounded-4xl bg-white shadow-[0_16px_60px_0_rgba(0,0,0,0.12),0_12px_20px_0_rgba(0,0,0,0.08),0_2px_8px_0_rgba(0,0,0,0.12)] sm:inset-x-0 sm:mx-auto sm:w-86"
        >
          <div className="mx-auto mt-3 h-1 w-14 shrink-0 cursor-grab rounded-[99px] bg-grey-100 active:cursor-grabbing" />
          <div className="flex flex-col gap-0.5 border-b border-grey-50 p-4">
            <Drawer.Title className="text-body-01">{title}</Drawer.Title>
            {description && (
              <Drawer.Description asChild>
                {typeof description === 'string' ? (
                  <span>{description}</span>
                ) : (
                  description
                )}
              </Drawer.Description>
            )}
          </div>
          <div className="overflow-y-auto overscroll-contain">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default BottomSheet;
