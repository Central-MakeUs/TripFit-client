import CheckCircleMotion from '@/components/check-circle-motion';

type CompleteStepProps = {
  roomName: string;
};

function CompleteStep({ roomName }: CompleteStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7">
      <CheckCircleMotion className="h-18 w-18" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-headline-01">{roomName}</span>
        <span className="text-body-01 text-grey-500">
          여행방이 추가되었어요!
        </span>
      </div>
    </div>
  );
}

export default CompleteStep;
