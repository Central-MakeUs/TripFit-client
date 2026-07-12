import { cva } from 'class-variance-authority';

export const ctaButtonGroupStyle = cva('flex w-full px-5 pt-2 pb-0.5', {
  variants: {
    layout: {
      single: 'flex-col items-start',
      'button-horizontal': 'flex-row items-start gap-2',
      'button-vertical': 'flex-col items-start gap-2',
      'text-link': 'flex-col items-center gap-2',
    },
  },
  defaultVariants: {
    layout: 'single',
  },
});
