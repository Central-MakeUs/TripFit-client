import { cva } from 'class-variance-authority';

export const roomCardStyle = cva(
  'flex h-51 w-80 shrink-0 flex-col rounded-3xl px-4',
  {
    variants: {
      type: {
        fill: 'items-start justify-between bg-blue-50/60 py-3 active:bg-blue-50/80',
        empty:
          'cursor-pointer items-center justify-center gap-2 border border-grey-100 bg-grey-20 pt-3 pb-4 active:bg-grey-50',
      },
    },
    defaultVariants: {
      type: 'fill',
    },
  },
);
