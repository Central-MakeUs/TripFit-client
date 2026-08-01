import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-title-01',
        'text-title-02',
        'text-headline-01',
        'text-headline-02',
        'text-headline-03',
        'text-headline-04',
        'text-body-01',
        'text-body-02',
        'text-body-03',
        'text-body-04',
        'text-body-05',
        'text-body-06',
        'text-caption-01',
        'text-caption-02',
        'text-caption-03',
        'text-caption-04',
        'text-caption-05',
        'text-caption-06',
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
