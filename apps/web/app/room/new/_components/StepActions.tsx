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
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full px-5 pt-2 pb-0.5 sm:max-w-90">
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
