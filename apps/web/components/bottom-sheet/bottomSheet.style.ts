import { cva } from 'class-variance-authority';

export const bottomSheetContentStyle = cva(
  'fixed flex max-h-[90vh] flex-col overflow-hidden bg-white shadow-[0_16px_60px_0_rgba(0,0,0,0.12),0_12px_20px_0_rgba(0,0,0,0.08),0_2px_8px_0_rgba(0,0,0,0.12)] sm:mx-auto sm:w-86',
  {
    variants: {
      variant: {
        modal: 'inset-x-2 bottom-8.5 rounded-4xl sm:inset-x-0',
        'non-modal': 'inset-x-0 bottom-0 rounded-t-4xl',
      },
    },
    defaultVariants: {
      variant: 'modal',
    },
  },
);
