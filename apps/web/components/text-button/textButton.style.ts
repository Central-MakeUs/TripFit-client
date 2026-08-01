import { cva } from 'class-variance-authority';

export const textButtonStyle = cva(
  'flex cursor-pointer items-center gap-1 rounded-xl text-grey-500 active:bg-grey-50',
  {
    variants: {
      size: {
        S: 'p-2 text-caption-02',
        M: 'p-2 text-body-05',
        L: 'px-3 py-2 text-body-03',
      },
    },
    defaultVariants: {
      size: 'S',
    },
  },
);
