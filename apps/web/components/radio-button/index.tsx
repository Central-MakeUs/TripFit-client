import { cn } from '@/utils/cn';

import { radioButtonStyle } from './radioButton.style';

type RadioButtonProps = {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  /** false면 button이 아닌 span으로 렌더링 — 부모가 이미 role="radio" 등으로 상호작용을 담당할 때 사용 */
  interactive?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function RadioButton({
  checked = false,
  className,
  disabled = false,
  interactive = true,
  onCheckedChange,
}: RadioButtonProps) {
  const handleClick = () => {
    onCheckedChange?.(!checked);
  };

  const visual = (
    <span className={radioButtonStyle({ checked })}>
      {checked && <span className="size-2 rounded-full bg-white" />}
    </span>
  );

  if (!interactive) {
    return (
      <span
        className={cn('flex size-11 items-center justify-center', className)}
      >
        {visual}
      </span>
    );
  }

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
      {visual}
    </button>
  );
}

export default RadioButton;
