import { cn } from '@/utils/cn';

import { toggleThumbStyle, toggleTrackStyle } from './toggle.style';

type ToggleProps = {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  'aria-label': string;
};

function Toggle({
  checked = false,
  className,
  disabled = false,
  onCheckedChange,
  'aria-label': ariaLabel,
}: ToggleProps) {
  const handleClick = () => {
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        toggleTrackStyle({ checked }),
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
    >
      <span className={toggleThumbStyle({ checked })} />
    </button>
  );
}

export default Toggle;
