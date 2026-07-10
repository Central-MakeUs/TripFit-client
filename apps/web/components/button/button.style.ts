import { cva } from 'class-variance-authority';

export const buttonStyle = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold disabled:cursor-not-allowed',
  {
    variants: {
      style: {
        fill: '',
        weak: '',
        outline: 'ring-1 ring-inset',
      },
      type: {
        primary: '',
        secondary: '',
      },
      size: {
        L: 'text-body-03',
        M: 'h-9 text-caption-01',
      },
      category: {
        text: '',
        'icon-L': '',
        'icon-R': '',
      },
    },
    compoundVariants: [
      {
        style: 'fill',
        type: 'primary',
        class:
          'bg-blue-500 text-white active:bg-blue-600 disabled:bg-grey-100 disabled:text-white',
      },
      {
        style: 'fill',
        type: 'secondary',
        class:
          'bg-grey-800 text-white active:bg-grey-900 disabled:bg-grey-100 disabled:text-white',
      },
      {
        style: 'weak',
        type: 'primary',
        class:
          'bg-blue-50 text-blue-600 active:bg-blue-100 disabled:bg-grey-100 disabled:text-white',
      },
      {
        style: 'weak',
        type: 'secondary',
        class:
          'bg-grey-50 text-grey-600 active:bg-grey-100 disabled:bg-grey-100 disabled:text-white',
      },
      {
        style: 'outline',
        type: 'primary',
        class:
          'ring-blue-100 bg-white text-blue-600 active:bg-blue-20 disabled:ring-grey-100 disabled:bg-grey-100 disabled:text-white',
      },
      {
        style: 'outline',
        type: 'secondary',
        class:
          'ring-grey-100 bg-white text-grey-600 active:bg-grey-50 disabled:ring-grey-100 disabled:bg-grey-100 disabled:text-white',
      },
      { size: 'L', category: 'text', class: 'px-4 py-2.5' },
      { size: 'L', category: 'icon-L', class: 'gap-1 py-2.5 pl-3 pr-4' },
      { size: 'L', category: 'icon-R', class: 'gap-1 py-2.5 pl-4 pr-3' },
      { size: 'M', category: 'text', class: 'px-3 py-2.5' },
      { size: 'M', category: 'icon-L', class: 'gap-0.5 py-2.5 pl-2 pr-3' },
      { size: 'M', category: 'icon-R', class: 'gap-0.5 py-2.5 pl-3 pr-2' },
    ],
    defaultVariants: {
      style: 'fill',
      type: 'primary',
      size: 'L',
      category: 'text',
    },
  },
);
