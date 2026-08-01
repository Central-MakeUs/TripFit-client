import { VariantProps } from 'class-variance-authority';

import { progressTrackStyle } from './progressBar.style';

type ProgressBarProps = {
  value: number; // 0 ~ 100
} & VariantProps<typeof progressTrackStyle>;

function ProgressBar({ value, size, trackColor }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={progressTrackStyle({ size, trackColor })}
    >
      <div
        className="h-full rounded-[99px] bg-[linear-gradient(90deg,var(--color-blue-400)_0%,var(--color-blue-500)_100%)] transition-[width]"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

export default ProgressBar;
