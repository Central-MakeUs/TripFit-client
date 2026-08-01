import { cva } from 'class-variance-authority';

export const iconButtonStyle = cva(
  'flex shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        small: 'h-8 w-8',
        default: 'h-11 w-11',
        shadow:
          'h-11 w-11 rounded-[99px] border-2 border-transparent bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04),0_0_12px_2px_rgba(0,0,0,0.08)] active:border-white active:bg-grey-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
