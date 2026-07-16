import { cva } from 'class-variance-authority';

export const toggleTrackStyle = cva(
  'relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out',
  {
    variants: {
      checked: {
        true: 'bg-blue-500',
        false: 'bg-grey-200',
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
);

export const toggleThumbStyle = cva(
  'absolute top-0.5 left-0.5 h-5 w-6 rounded-full transition-all duration-200 ease-in-out',
  {
    variants: {
      checked: {
        true: 'translate-x-4 bg-blue-50',
        false: 'translate-x-0 bg-white',
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
);
