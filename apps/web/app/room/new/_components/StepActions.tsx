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
      {/* TODO: 공통 버튼 컴포넌트로 교체 */}
      <button
        type="button"
        disabled={primaryDisabled}
        onClick={onPrimaryClick}
        className="w-full cursor-pointer rounded-xl px-4 py-2.5 bg-grey-800 text-center text-white disabled:cursor-not-allowed disabled:bg-grey-100 disabled:text-white"
      >
        {primaryLabel}
      </button>
      {secondaryLabel && onSecondaryClick && (
        <button
          type="button"
          onClick={onSecondaryClick}
          className="text-body-05 text-grey-500 mx-auto block w-fit cursor-pointer mt-2 p-2 text-center"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}

export default StepActions;
