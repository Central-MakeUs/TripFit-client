import Image from 'next/image';

import { cn } from '@/utils/cn';

import { tagIconSrc, tagStyle } from './tag.style';

type TagProps = {
  category?: 'icon' | 'icon-L' | 'text';
  className?: string;
  color?: 'blue' | 'red';
  text?: string;
  type?: 'primary' | 'secondary' | 'tertiary';
};

function Tag({
  category = 'text',
  className,
  color = 'blue',
  text,
  type = 'primary',
}: TagProps) {
  const hasIcon = category === 'icon' || category === 'icon-L';
  const iconSize = category === 'icon' ? 12 : 16;

  return (
    <div className={cn(tagStyle({ category, color, type }), className)}>
      {hasIcon && (
        <Image
          src={tagIconSrc(color, type)}
          alt=""
          width={iconSize}
          height={iconSize}
        />
      )}
      {category !== 'icon' && <span>{text}</span>}
    </div>
  );
}

export default Tag;
