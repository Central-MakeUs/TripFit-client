import { cn } from '@/utils/cn';

import { modalItemStyle, modalStyle } from './modal.style';

type ModalItemT = {
  label: string;
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
            item.variant === 'destructive' ? 'text-red-300' : 'text-black/80',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default Modal;
