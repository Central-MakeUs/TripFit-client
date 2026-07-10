import { type ReactNode } from 'react';

import ArrowLeftIcon from '@/assets/icons/arrow-left-300.svg';
import { cn } from '@/utils/cn';

import { textButtonStyle } from './textButton.style';

type TextButtonProps = {
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
  size?: 'S' | 'M' | 'L';
  text: string;
};

function TextButton({
  className,
  icon,
  onClick,
  size = 'S',
  text,
}: TextButtonProps) {
  const iconSize = size === 'L' ? 'size-5' : 'size-4';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(textButtonStyle({ size }), className)}
    >
      <span>{text}</span>
      {icon ?? <ArrowLeftIcon className={iconSize} />}
    </button>
  );
}

export default TextButton;
