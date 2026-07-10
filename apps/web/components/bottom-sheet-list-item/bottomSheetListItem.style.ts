import { cva } from 'class-variance-authority';

export const bottomSheetListItemStyle = cva(
  'text-body-05 flex w-full cursor-pointer items-center rounded-lg border px-3 transition-colors',
  {
    variants: {
      selected: {
        false: '',
        true: '',
      },
      category: {
        default: 'py-2 border-none',
        red: 'py-3',
      },
    },
    compoundVariants: [
      {
        selected: false,
        category: 'default',
        class: 'bg-white text-grey-800 hover:bg-grey-20 active:bg-grey-20',
      },
      {
        selected: true,
        category: 'default',
        class: 'bg-blue-50 text-blue-800',
      },
      {
        selected: false,
        category: 'red',
        class:
          'border-grey-50 bg-white text-grey-800 hover:border-grey-20 hover:bg-grey-20 active:border-grey-20 active:bg-grey-20',
      },
      {
        selected: true,
        category: 'red',
        class: 'border-red-100 bg-red-20 text-grey-800',
      },
    ],
    defaultVariants: {
      selected: false,
      category: 'default',
    },
  },
);
