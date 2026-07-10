import { cva } from 'class-variance-authority';

export const daySolidIndicatorStyle = cva('h-8 w-8 rounded-full', {
  variants: {
    status: {
      empty: 'bg-grey-50',
      light: 'bg-blue-200',
      full: 'bg-blue-500',
    },
  },
  defaultVariants: {
    status: 'empty',
  },
});
