import { cva } from 'class-variance-authority';

export const dayItemStyle = cva(
  'flex h-12 flex-1 cursor-pointer items-center justify-center rounded-xl px-[1.6px] py-[1.2px] text-body-05',
  {
    variants: {
      selected: {
        true: 'bg-blue-400 text-white',
        false: 'bg-grey-20 text-grey-800',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);
