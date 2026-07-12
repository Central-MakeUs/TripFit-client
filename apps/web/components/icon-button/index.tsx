import { ButtonHTMLAttributes, ReactNode } from 'react';

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

type IconButtonProps = {
  icon: ReactNode;
  size?: IconButtonSize;
  'aria-label': string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>;

function IconButton({
  icon,
  size = 'default',
  className,
  disabled,
  ...rest
}: IconButtonProps) {
  const iconSize = ICON_SIZE_MAP[size];

  const iconElement = (
    <span className="shrink-0" style={{ width: iconSize, height: iconSize }}>
      {icon}
    </span>
  );

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(iconButtonStyle({ size }), className)}
      {...rest}
    >
      {size === 'shadow' ? (
        iconElement
      ) : (
        <span className={pressedWrapperClassName}>{iconElement}</span>
      )}
    </button>
  );
}

export default IconButton;
