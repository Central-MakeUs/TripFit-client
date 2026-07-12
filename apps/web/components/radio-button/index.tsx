import { cn } from '@/utils/cn';

import { radioButtonStyle } from './radioButton.style';

type RadioButtonProps = {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function RadioButton({
  checked = false,
  className,
  disabled = false,
  onCheckedChange,
}: RadioButtonProps) {
  const handleClick = () => {
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex size-11 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
    >
      <span className={radioButtonStyle({ checked })}>
        {checked && <span className="size-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}

export default RadioButton;
