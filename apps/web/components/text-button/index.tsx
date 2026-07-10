import Image from 'next/image';

import { cn } from '@/utils/cn';

import { textButtonStyle } from './textButton.style';

type TextButtonProps = {
  className?: string;
  icon?: boolean;
  onClick?: () => void;
  size?: 'S' | 'M' | 'L';
  text: string;
};

function TextButton({
  className,
  icon = true,
  onClick,
  size = 'S',
  text,
}: TextButtonProps) {
  const iconSize = size === 'L' ? 20 : 16;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(textButtonStyle({ size }), className)}
    >
      <span>{text}</span>
      {icon && (
        <Image
          src="/icons/arrow-right.svg"
          alt=""
          width={iconSize}
          height={iconSize}
        />
      )}
    </button>
  );
}

export default TextButton;
