'use client';

import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/utils/cn';

import { floatingButtonStyle } from './floatingButton.style';

type FloatingButtonColor = 'blue' | 'black';

type LinkFloatingButtonProps = {
  icon: ReactNode;
  href: string;
  color?: FloatingButtonColor;
  disabled?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

type ButtonFloatingButtonProps = {
  icon: ReactNode;
  href?: undefined;
  color?: FloatingButtonColor;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type FloatingButtonProps = LinkFloatingButtonProps | ButtonFloatingButtonProps;

function FloatingButton(props: FloatingButtonProps) {
  if (props.href) {
    const {
      icon,
      href,
      color = 'blue',
      disabled,
      className,
      onClick,
      ...rest
    } = props as LinkFloatingButtonProps;

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
          floatingButtonStyle({ color }),
          disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          className,
        )}
        {...rest}
      >
        {icon}
      </Link>
    );
  }

  const {
    icon,
    color = 'blue',
    disabled,
    className,
    ...rest
  } = props as ButtonFloatingButtonProps;

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(floatingButtonStyle({ color }), className)}
      {...rest}
    >
      {icon}
    </button>
  );
}

export default FloatingButton;
