import Image from 'next/image';

import calendarConnectIllustration from '@/assets/images/calendar-connect-illustration.png';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';

type CalendarConnectIntroStepProps = {
  onBack: () => void;
  onConnect: () => void;
  onSkip: () => void;
  title?: string;
  progress?: number;
};

function CalendarConnectIntroStep({
  onBack,
  onConnect,
  onSkip,
  title = '캘린더 연동하기',
  progress,
}: CalendarConnectIntroStepProps) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title={title} onBack={onBack} />
      {progress !== undefined && (
        <div className="px-5 py-1">
          <ProgressBar size="sm" value={progress} />
        </div>
      )}
      <div className="flex w-full flex-1 flex-col px-5">
        <p className="pt-3 pb-13 text-body-01 text-black">
          기존 일정을 불러와
          <br />
          간편하게 여행 일정을 추천받으세요.
        </p>
        <div className="flex flex-1 items-start justify-center pt-25">
          <Image
            src={calendarConnectIllustration}
            alt=""
            width={168}
            height={168}
          />
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
