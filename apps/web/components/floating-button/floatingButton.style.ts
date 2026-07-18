import { cva } from 'class-variance-authority';

export const floatingButtonStyle = cva(
  'pointer-events-auto absolute right-5 bottom-4 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-white/40 text-white shadow-[0_8px_12px_0_var(--color-grey-100)] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      color: {
        blue: 'bg-blue-500 hover:bg-[linear-gradient(0deg,rgba(0,119,204,0.3)_0%,rgba(0,119,204,0.3)_100%),var(--color-blue-500)] active:bg-[linear-gradient(0deg,rgba(0,119,204,0.3)_0%,rgba(0,119,204,0.3)_100%),var(--color-blue-500)]',
        black:
          'bg-grey-800 hover:bg-[linear-gradient(0deg,rgba(28,29,31,0.3)_0%,rgba(28,29,31,0.3)_100%),var(--color-grey-800)] active:bg-[linear-gradient(0deg,rgba(28,29,31,0.3)_0%,rgba(28,29,31,0.3)_100%),var(--color-grey-800)]',
      },
    },
    defaultVariants: {
      color: 'blue',
    },
  },
);
