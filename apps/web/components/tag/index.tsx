import CrownIcon from '@/assets/icons/crown.svg';
import { cn } from '@/utils/cn';

import { tagStyle } from './tag.style';

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
  const iconSize = category === 'icon' ? 'size-3' : 'size-4';

  return (
    <div className={cn(tagStyle({ category, color, type }), className)}>
      {hasIcon && <CrownIcon className={iconSize} />}
      {category !== 'icon' && <span>{text}</span>}
    </div>
  );
}

export default Tag;
