import { cva } from 'class-variance-authority';

export const progressTrackStyle = cva('w-full overflow-hidden rounded-[99px]', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-1.5',
      lg: 'h-2.5',
    },
    trackColor: {
      grey: 'bg-grey-20',
      white: 'bg-white',
    },
  },
  defaultVariants: {
    size: 'md',
    trackColor: 'grey',
  },
});
