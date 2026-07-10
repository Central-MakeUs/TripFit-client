import CheckCircleIcon from '@/assets/icons/check-circle.svg';

type CompleteStepProps = {
  destination: string;
};

function CompleteStep({ destination }: CompleteStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7">
      <CheckCircleIcon className="h-18 w-18" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-headline-01">{destination} 여행</span>
        <span className="text-body-01 text-grey-500">
          여행방이 추가되었어요!
        </span>
      </div>
    </div>
  );
}

export default CompleteStep;
