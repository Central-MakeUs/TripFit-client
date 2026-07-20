import { ReactNode } from 'react';

import ExclamationMarkIcon from '@/assets/icons/exclamation-mark.svg';
import WarningTriangleIcon from '@/assets/icons/warning-triangle.svg';

type AlertModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'info' | 'danger';
  title: string;
  description: ReactNode;
  primaryText: string;
  onPrimaryClick: () => void;
  secondaryText?: string;
  onSecondaryClick?: () => void;
};

function AlertModal({
  open,
  onOpenChange,
  variant = 'info',
  title,
  description,
  primaryText,
  onPrimaryClick,
  secondaryText,
  onSecondaryClick,
}: AlertModalProps) {
  if (!open) return null;

  return (
    <div
      aria-hidden
      onClick={() => onOpenChange(false)}
      className="fixed inset-x-0 top-0 bottom-0 z-50 mx-auto flex w-full items-center justify-center bg-black/25 px-5 sm:max-w-90"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-80 flex-col items-center gap-7 rounded-4xl bg-white px-3 pt-7 pb-3 shadow-[0_16px_60px_0_rgba(0,0,0,0.12),0_12px_20px_0_rgba(0,0,0,0.08),0_2px_8px_0_rgba(0,0,0,0.12)]"
      >
        <div className="flex w-full flex-col items-center gap-4">
          {variant === 'danger' ? (
            <div className="relative h-13 w-15 text-red-50">
              <WarningTriangleIcon className="size-full" />
              <ExclamationMarkIcon className="absolute top-[65%] left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-red-300" />
            </div>
          ) : (
            <div className="flex size-13 items-center justify-center rounded-full bg-blue-100 text-blue-500">
              <ExclamationMarkIcon className="h-6 w-auto" />
            </div>
          )}
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-body-01 text-black">{title}</h2>
            <div className="text-body-06 text-grey-500">{description}</div>
          </div>
        </div>
        <div className="flex w-full items-start gap-2">
          {secondaryText && (
            <button
              type="button"
              onClick={onSecondaryClick}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-full bg-grey-50 px-4 py-2.5 text-body-03 text-grey-600"
            >
              {secondaryText}
            </button>
          )}
          <button
            type="button"
            onClick={onPrimaryClick}
            className="flex flex-1 cursor-pointer items-center justify-center rounded-full bg-grey-800 px-4 py-2.5 text-body-03 text-white"
          >
            {primaryText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
