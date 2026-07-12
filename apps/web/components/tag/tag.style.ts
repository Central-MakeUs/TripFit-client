import { cva } from 'class-variance-authority';

export const tagStyle = cva('inline-flex items-center justify-center', {
  variants: {
    category: {
      icon: 'size-5',
      'icon-L': 'gap-0.5 px-2 py-1',
      text: 'px-2 py-1',
    },
    color: {
      blue: 'rounded-full text-caption-04',
      red: 'rounded-lg text-caption-03',
    },
    type: {
      primary: '',
      secondary: '',
      tertiary: 'bg-grey-100 text-grey-400',
    },
  },
  compoundVariants: [
    { color: 'blue', type: 'primary', class: 'bg-blue-100 text-blue-600' },
    { color: 'blue', type: 'secondary', class: 'bg-blue-50 text-blue-600' },
    { color: 'red', type: 'primary', class: 'bg-red-50 text-red-300' },
    { color: 'red', type: 'secondary', class: 'bg-red-20 text-red-200' },
  ],
  defaultVariants: {
    category: 'text',
    color: 'blue',
    type: 'primary',
  },
});
