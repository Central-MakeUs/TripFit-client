import { cva } from 'class-variance-authority';

export const textareaContainerStyle = cva(
  'min-h-30 flex items-start gap-2 rounded-xl border py-3 transition-colors',
  {
    variants: {
      error: {
        true: 'border-red-200 bg-red-20',
        false:
          'border-grey-100 bg-white hover:border-grey-400 focus-within:border-grey-400 has-[:disabled]:border-grey-100 has-[:disabled]:bg-grey-20',
      },
      hasPrefix: {
        true: 'pl-3 pr-4',
        false: 'px-4',
      },
    },
    defaultVariants: {
      error: false,
      hasPrefix: false,
    },
  },
);
