import { cva } from 'class-variance-authority';

export const checkboxStyle = cva('relative size-5 shrink-0 rounded', {
  variants: {
    checked: {
      true: 'flex items-center justify-center bg-blue-500',
      false: 'border-[1.5px] border-grey-200',
    },
  },
  defaultVariants: {
    checked: false,
  },
});
