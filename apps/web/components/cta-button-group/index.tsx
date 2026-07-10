import Button from '@/components/button';
import TextButton from '@/components/text-button';
import { cn } from '@/utils/cn';

import { ctaButtonGroupStyle } from './ctaButtonGroup.style';

type CtaButtonGroupProps = {
  className?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryText: string;
  secondaryText?: string;
  secondaryVariant?: 'button-horizontal' | 'button-vertical' | 'text-link';
};

function CtaButtonGroup({
  className,
  onPrimaryClick,
  onSecondaryClick,
  primaryText,
  secondaryText,
  secondaryVariant = 'button-horizontal',
}: CtaButtonGroupProps) {
  if (!secondaryText) {
    return (
      <div className={cn(ctaButtonGroupStyle({ layout: 'single' }), className)}>
        <Button
          text={primaryText}
          onClick={onPrimaryClick}
          className="w-full"
        />
      </div>
    );
  }

  if (secondaryVariant === 'text-link') {
    return (
      <div
        className={cn(ctaButtonGroupStyle({ layout: 'text-link' }), className)}
      >
        <Button
          text={primaryText}
          onClick={onPrimaryClick}
          className="w-full"
        />
        <TextButton size="M" text={secondaryText} onClick={onSecondaryClick} />
      </div>
    );
  }

  if (secondaryVariant === 'button-vertical') {
    return (
      <div
        className={cn(
          ctaButtonGroupStyle({ layout: 'button-vertical' }),
          className,
        )}
      >
        <Button
          text={primaryText}
          onClick={onPrimaryClick}
          className="w-full"
        />
        <Button
          text={secondaryText}
          style="weak"
          onClick={onSecondaryClick}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        ctaButtonGroupStyle({ layout: 'button-horizontal' }),
        className,
      )}
    >
      <Button
        text={secondaryText}
        style="weak"
        onClick={onSecondaryClick}
        className="flex-1"
      />
      <Button text={primaryText} onClick={onPrimaryClick} className="flex-1" />
    </div>
  );
}

export default CtaButtonGroup;
