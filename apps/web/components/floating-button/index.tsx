'use client';

import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/utils/cn';

import { floatingButtonStyle } from './floatingButton.style';

type FloatingButtonColor = 'blue' | 'black';

// right-5/bottom-10을 fixed 요소에 직접 주면 뷰포트(브라우저 창) 기준으로 붙는다.
// 데스크톱처럼 뷰포트가 넓을 때도 max-w-90 콘텐츠 컬럼 안쪽 모서리에 붙도록,
// 컬럼 폭으로 제한된 래퍼 안에서 absolute로 위치를 잡는다.
const floatingButtonWrapperClassName =
  'pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full sm:max-w-90';

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
      <div className={floatingButtonWrapperClassName}>
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
      </div>
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
    <div className={floatingButtonWrapperClassName}>
      <button
        type="button"
        disabled={disabled}
        className={cn(floatingButtonStyle({ color }), className)}
        {...rest}
      >
        {icon}
      </button>
    </div>
  );
}

export default FloatingButton;
