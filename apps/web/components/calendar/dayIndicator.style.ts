import { cva } from 'class-variance-authority';

export const dayIndicatorStyle = cva(
  'flex aspect-square h-8 w-8 items-center justify-center rounded-lg p-[3px]',
  {
    variants: {
      status: {
        available: 'bg-blue-500',
        partial: 'bg-blue-50',
        unavailable: 'bg-grey-20 opacity-60',
      },
    },
    defaultVariants: {
      status: 'unavailable',
    },
  },
);
