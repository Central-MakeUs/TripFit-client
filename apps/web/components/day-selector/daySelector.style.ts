import { cva } from 'class-variance-authority';

export const dayItemStyle = cva(
  'flex h-[47px] flex-1 cursor-pointer items-center justify-center rounded-2xl p-2.5 text-body-06',
  {
    variants: {
      selected: {
        true: 'bg-[#5cc3ff] text-white',
        false: 'bg-black/[0.02] text-black/80',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);
