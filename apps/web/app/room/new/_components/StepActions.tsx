import Button from '@/components/button';
import TextButton from '@/components/text-button';

type StepActionsProps = {
  primaryLabel: string;
  onPrimaryClick: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
};

function StepActions({
  primaryLabel,
  onPrimaryClick,
  primaryDisabled,
  secondaryLabel,
  onSecondaryClick,
}: StepActionsProps) {
  return (
    <div className="mt-auto w-full pt-2 pb-0.5">
      <Button
        text={primaryLabel}
        type="secondary"
        disabled={primaryDisabled}
        onClick={onPrimaryClick}
        className="w-full"
      />
      {secondaryLabel && onSecondaryClick && (
        <TextButton
          text={secondaryLabel}
          icon={false}
          onClick={onSecondaryClick}
          className="mx-auto block w-fit"
        />
      )}
    </div>
  );
}

export default StepActions;
