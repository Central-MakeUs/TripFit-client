'use client';

import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/utils/cn';

const floatingButtonClassName =
  'fixed right-5 bottom-10 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-[2.5px] border-white/40 bg-blue-500 text-white shadow-[0_8px_12px_0_var(--color-grey-100)] transition-colors hover:bg-[linear-gradient(0deg,rgba(0,119,204,0.3)_0%,rgba(0,119,204,0.3)_100%),var(--color-blue-500)] active:bg-[linear-gradient(0deg,rgba(0,119,204,0.3)_0%,rgba(0,119,204,0.3)_100%),var(--color-blue-500)] disabled:cursor-not-allowed disabled:opacity-50';

type LinkFloatingButtonProps = {
  icon: ReactNode;
  href: string;
  disabled?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

type ButtonFloatingButtonProps = {
  icon: ReactNode;
  href?: undefined;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type FloatingButtonProps = LinkFloatingButtonProps | ButtonFloatingButtonProps;

function FloatingButton(props: FloatingButtonProps) {
  if (props.href) {
    const { icon, href, disabled, className, onClick, ...rest } =
      props as LinkFloatingButtonProps;

    return (
      <Link
        href={href}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        className={cn(
          floatingButtonClassName,
          disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          className,
        )}
        {...rest}
      >
        {icon}
      </Link>
    );
  }

  const { icon, disabled, className, ...rest } =
    props as ButtonFloatingButtonProps;

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(floatingButtonClassName, className)}
      {...rest}
    >
      {icon}
    </button>
  );
}

export default FloatingButton;
