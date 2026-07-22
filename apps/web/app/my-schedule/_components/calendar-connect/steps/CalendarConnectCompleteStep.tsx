import CtaButtonGroup from '@/components/cta-button-group';

import CheckCircleMotion from '../CheckCircleMotion';

type CalendarConnectCompleteStepProps = {
  onConfirm: () => void;
};

function CalendarConnectCompleteStep({
  onConfirm,
}: CalendarConnectCompleteStepProps) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-5">
        <CheckCircleMotion className="h-18 w-18" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-headline-01 text-black">
            구글 캘린더 연동 완료!
          </span>
          <span className="text-body-01 text-center text-grey-500">
            입력되어 있는 일정을
            <br />
            캘린더에 추가했어요
          </span>
        </div>
      </div>
      <CtaButtonGroup primaryText="확인" onPrimaryClick={onConfirm} />
    </div>
  );
}

export default CalendarConnectCompleteStep;
