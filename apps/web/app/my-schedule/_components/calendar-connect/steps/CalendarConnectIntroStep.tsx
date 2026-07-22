import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';

type CalendarConnectIntroStepProps = {
  onBack: () => void;
  onConnect: () => void;
  onSkip: () => void;
};

function CalendarConnectIntroStep({
  onBack,
  onConnect,
  onSkip,
}: CalendarConnectIntroStepProps) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="캘린더 연동하기" onBack={onBack} />
      <div className="flex w-full flex-1 flex-col px-5">
        <p className="pt-3 pb-13 text-body-01 text-black">
          기존 일정을 불러와
          <br />
          간편하게 여행 일정을 추천받으세요.
        </p>
        <div className="flex flex-1 items-start justify-center pt-25">
          <div className="size-30 rounded-[20px] bg-grey-100" />
        </div>
      </div>
      <CtaButtonGroup
        primaryText="구글 캘린더 연동하기"
        onPrimaryClick={onConnect}
        secondaryText="다음에 하기"
        secondaryVariant="text-link"
        onSecondaryClick={onSkip}
      />
    </div>
  );
}

export default CalendarConnectIntroStep;
