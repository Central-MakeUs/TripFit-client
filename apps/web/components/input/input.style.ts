import { cva } from 'class-variance-authority';

export const inputContainerStyle = cva(
  'flex items-center gap-2 rounded-xl border px-4 py-3 transition-colors',
  {
    variants: {
      error: {
        true: 'border-red-200 bg-red-20',
        false:
          'border-grey-100 bg-white hover:border-grey-400 focus-within:border-grey-400 has-[:disabled]:border-grey-100 has-[:disabled]:bg-grey-20',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);
