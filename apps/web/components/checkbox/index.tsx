import CheckIcon from '@/assets/icons/check.svg';
import { cn } from '@/utils/cn';

import { checkboxStyle } from './checkbox.style';

type CheckboxProps = {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  /** false면 button이 아닌 span으로 렌더링 — 부모가 이미 role="checkbox" 등으로 상호작용을 담당할 때 사용 */
  interactive?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function Checkbox({
  checked = false,
  className,
  disabled = false,
  interactive = true,
  onCheckedChange,
}: CheckboxProps) {
  const handleClick = () => {
    onCheckedChange?.(!checked);
  };

  const visual = (
    <span className={checkboxStyle({ checked })}>
      {checked && <CheckIcon className="size-4 text-white" />}
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
      role="checkbox"
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

export default Checkbox;
