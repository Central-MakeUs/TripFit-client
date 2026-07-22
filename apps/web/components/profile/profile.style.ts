import { cva } from 'class-variance-authority';

export const profileStyle = cva(
  'flex shrink-0 items-center justify-center rounded-full pt-0.5',
  {
    variants: {
      size: {
        S: 'size-7 text-caption-06',
        M: 'size-9 text-caption-06',
        L: 'size-12 text-body-06',
      },
    },
    defaultVariants: {
      size: 'S',
    },
  },
);

export const profileColorStyle: Record<string, Record<1 | 2, string>> = {
  purple: {
    1: 'bg-purple-100 text-purple-300',
    2: 'bg-purple-300 text-purple-50',
  },
  pink: {
    1: 'bg-pink-100 text-pink-300',
    2: 'bg-pink-300 text-pink-50',
  },
  orange: {
    1: 'bg-orange-100 text-orange-300',
    2: 'bg-orange-300 text-orange-50',
  },
  yellow: {
    1: 'bg-yellow-100 text-yellow-600',
    2: 'bg-yellow-500 text-yellow-700',
  },
  green: {
    1: 'bg-yellow-green-100 text-yellow-green-600',
    2: 'bg-yellow-green-600 text-yellow-green-50',
  },
};

export const profileDisabledStyle = 'bg-grey-100 text-grey-400';
