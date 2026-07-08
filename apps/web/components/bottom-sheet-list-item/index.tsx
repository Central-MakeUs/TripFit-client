import { ButtonHTMLAttributes } from 'react';
import { VariantProps } from 'class-variance-authority';

import { bottomSheetListItemStyle } from './bottomSheetListItem.style';

type BottomSheetListItemProps = {
  children: string;
} & VariantProps<typeof bottomSheetListItemStyle> &
  ButtonHTMLAttributes<HTMLButtonElement>;

function BottomSheetListItem({
  children,
  selected,
  category,
  className,
  ...rest
}: BottomSheetListItemProps) {
  return (
    <button
      type="button"
      className={`${bottomSheetListItemStyle({ selected, category })} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default BottomSheetListItem;
