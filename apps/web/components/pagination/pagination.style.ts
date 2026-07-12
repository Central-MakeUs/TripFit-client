import { cva } from 'class-variance-authority';

export const paginationDotStyle = cva('h-1.5 shrink-0 rounded-full', {
  variants: {
    active: {
      true: 'w-6 bg-blue-400',
      false: 'w-1.5 bg-grey-100',
    },
  },
  defaultVariants: {
    active: false,
  },
});
