import { ReactNode } from 'react';

import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import { cn } from '@/utils/cn';

type CheckCircleMotionProps = {
  className?: string;
};

function CheckCircleMotion({ className }: CheckCircleMotionProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <circle
        cx="36"
        cy="36"
        r="36"
        fill="#0095FF"
        className="[transform-box:fill-box] origin-center animate-check-circle-pop"
      />
      <path
        d="M19 35.5L28.5885 45.9602C29.3579 46.7996 30.6719 46.8281 31.477 46.023L52.5 25"
        pathLength="1"
        stroke="#CCEAFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="1 1"
        className="animate-check-circle-draw"
      />
    </svg>
  );
}

type CheckCompleteStepProps = {
  title?: string;
  /** true면 헤더+프로그레스바를 함께 보여줌 — 미지정 시 체크마크와 CTA만 있는 화면 */
  showHeader?: boolean;
  /** 헤더의 뒤로가기 버튼 동작 — showHeader와 무관하게 순수 뒤로가기 핸들러로만 쓰인다 */
  onBack?: () => void;
  heading: ReactNode;
  description?: ReactNode;
  primaryText?: string;
  primaryColor?: 'primary' | 'secondary';
  onPrimaryClick: () => void;
  secondaryText?: string;
  onSecondaryClick?: () => void;
};

function CheckCompleteStep({
  title = '기본 정보 입력',
  showHeader = false,
  onBack,
  heading,
  description,
  primaryText = '시작하기',
  primaryColor = 'secondary',
  onPrimaryClick,
  secondaryText,
  onSecondaryClick,
}: CheckCompleteStepProps) {
  return (
    <div className="flex w-full flex-1 flex-col">
      {showHeader && (
        <>
          <Header variant="page" title={title} onBack={onBack} />
          <div className="px-5 py-1">
            <ProgressBar size="sm" value={100} />
          </div>
        </>
      )}
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-7 px-5">
        <CheckCircleMotion className="h-18 w-18" />
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-headline-01 text-black">{heading}</span>
          {description && (
            <span className="text-body-01 text-grey-500">{description}</span>
          )}
        </div>
      </div>
      <CtaButtonGroup
        primaryText={primaryText}
        primaryColor={primaryColor}
        onPrimaryClick={onPrimaryClick}
        secondaryText={secondaryText}
        secondaryVariant="text-link"
        secondaryIcon={false}
        onSecondaryClick={onSecondaryClick}
      />
    </div>
  );
}

export default CheckCompleteStep;
