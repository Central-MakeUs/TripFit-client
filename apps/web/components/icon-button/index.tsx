import { MouseEventHandler, ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';

import { cn } from '@/utils/cn';

import { iconButtonStyle } from './iconButton.style';

const pressedWrapperClassName =
  'flex items-center justify-center rounded-lg p-1 transition-colors active:mix-blend-multiply active:bg-grey-20';

type IconButtonSize = 'small' | 'default' | 'shadow';

const ICON_SIZE_MAP: Record<IconButtonSize, number> = {
  small: 16,
  default: 24,
  shadow: 28,
};

type IconButtonBaseProps = {
  icon: ReactNode;
  size?: IconButtonSize;
  'aria-label': string;
  className?: string;
};

type IconButtonAsButtonProps = IconButtonBaseProps & {
  href?: undefined;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

type IconButtonAsLinkProps = IconButtonBaseProps & {
  href: LinkProps['href'];
};

type IconButtonProps = IconButtonAsButtonProps | IconButtonAsLinkProps;

function IconButton(props: IconButtonProps) {
  const { icon, size = 'default', className, 'aria-label': ariaLabel } = props;
  const iconSize = ICON_SIZE_MAP[size];

  const iconElement = (
    <span
      className="shrink-0 [&>svg]:size-full"
      style={{ width: iconSize, height: iconSize }}
    >
      {icon}
    </span>
  );

  const content =
    size === 'shadow' ? (
      iconElement
    ) : (
      <span className={pressedWrapperClassName}>{iconElement}</span>
    );

  const buttonClassName = cn(iconButtonStyle({ size }), className);

  if (props.href !== undefined) {
    return (
      <Link
        href={props.href}
        aria-label={ariaLabel}
        className={buttonClassName}
      >
        {content}
      </Link>
    );
  }

  const { disabled, onClick } = props;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={buttonClassName}
    >
      {content}
    </button>
  );
}

export default IconButton;
