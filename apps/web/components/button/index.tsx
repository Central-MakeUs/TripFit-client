import { type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { buttonStyle } from './button.style';

type ButtonProps = {
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  size?: 'L' | 'M';
  style?: 'fill' | 'weak' | 'outline';
  text: string;
  type?: 'primary' | 'secondary';
};

function Button({
  className,
  disabled = false,
  icon,
  iconPosition = 'left',
  onClick,
  size = 'L',
  style = 'fill',
  text,
  type = 'primary',
}: ButtonProps) {
  const category = icon
    ? iconPosition === 'left'
      ? 'icon-L'
      : 'icon-R'
    : 'text';
  const iconSize = size === 'L' ? 24 : 16;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(buttonStyle({ style, type, size, category }), className)}
    >
      {icon && iconPosition === 'left' && (
        <span
          className="shrink-0 [&>svg]:size-full"
          style={{ width: iconSize, height: iconSize }}
        >
          {icon}
        </span>
      )}
      <span>{text}</span>
      {icon && iconPosition === 'right' && (
        <span
          className="shrink-0 [&>svg]:size-full"
          style={{ width: iconSize, height: iconSize }}
        >
          {icon}
        </span>
      )}
    </button>
  );
}

export default Button;
