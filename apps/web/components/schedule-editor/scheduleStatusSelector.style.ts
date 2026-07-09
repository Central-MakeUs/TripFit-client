import { cva } from 'class-variance-authority';

export const scheduleStatusOptionStyle = cva(
  'flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[99px] border w-12 h-15',
  {
    variants: {
      selected: {
        false: 'border-grey-100 bg-white',
        true: 'border-red-100 bg-red-20',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);
