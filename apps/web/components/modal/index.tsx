import { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { modalItemStyle, modalStyle } from './modal.style';

type ModalItemT = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
};

type ModalProps = {
  className?: string;
  items: ModalItemT[];
};

function Modal({ className, items }: ModalProps) {
  return (
    <div className={cn(modalStyle, className)}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={cn(
            modalItemStyle,
            'flex items-center gap-2',
            item.variant === 'destructive' ? 'text-red-300' : 'text-grey-800',
          )}
        >
          {item.icon && (
            <span
              className={cn(
                'flex size-6 shrink-0 [&>svg]:size-full',
                item.variant !== 'destructive' && 'text-grey-400',
              )}
            >
              {item.icon}
            </span>
          )}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default Modal;
