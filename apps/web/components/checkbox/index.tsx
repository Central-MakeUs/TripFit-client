import CheckIcon from '@/assets/icons/check.svg';
import { cn } from '@/utils/cn';

import { checkboxStyle } from './checkbox.style';

type CheckboxProps = {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function Checkbox({
  checked = false,
  className,
  disabled = false,
  onCheckedChange,
}: CheckboxProps) {
  const handleClick = () => {
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex size-11 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
    >
      <span className={checkboxStyle({ checked })}>
        {checked && <CheckIcon className="size-4 text-white" />}
      </span>
    </button>
  );
}

export default Checkbox;
