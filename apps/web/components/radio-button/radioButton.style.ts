import { cva } from 'class-variance-authority';

export const radioButtonStyle = cva(
  'relative size-4 shrink-0 rounded-full border-[1.5px]',
  {
    variants: {
      checked: {
        true: 'flex items-center justify-center border-blue-500 bg-blue-500',
        false: 'border-grey-200',
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
);
