import { ReactNode } from 'react';

import CloseIcon from '@/assets/icons/close.svg';
import CheckCircleMotion from '@/components/check-circle-motion';
import Confetti from '@/components/confetti';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import ProgressBar from '@/components/progress-bar';

type CheckCompleteStepProps = {
  title?: string;
  /** true면 헤더+프로그레스바를 함께 보여줌 — 미지정 시 체크마크와 CTA만 있는 화면 */
  showHeader?: boolean;
  /** 헤더의 뒤로가기 버튼 동작 — showHeader와 무관하게 순수 뒤로가기 핸들러로만 쓰인다 */
  onBack?: () => void;
  /** 지정하면 헤더 오른쪽에 전체 닫기(X) 버튼을 보여줌 — 자유롭게 나갈 수 있는
   * 임의 편집 플로우에서만 쓰고, 반드시 완료해야 하는 필수 입력 플로우에는 넘기지 않는다 */
  onClose?: () => void;
  /** true면 체크마크 주변에 컨페티 연출을 함께 보여줌 — 지정된 3개 완료 화면
   * (여행방 생성 완료, 추천 결과 확정, 회원가입 기본정보 완료)에서만 켠다 */
  showConfetti?: boolean;
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
  onClose,
  showConfetti = false,
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
          <Header
            variant="page"
            title={title}
            onBack={onBack}
            rightSlot={
              onClose && (
                <IconButton
                  onClick={onClose}
                  aria-label="닫기"
                  icon={<CloseIcon className="text-grey-500" />}
                />
              )
            }
          />
          <div className="px-5 py-1">
            <ProgressBar size="sm" value={100} />
          </div>
        </>
      )}
      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-7 px-5">
        {showConfetti && <Confetti />}
        <CheckCircleMotion className="relative z-10 h-18 w-18" />
        <div className="relative z-10 flex flex-col items-center gap-0.5 text-center">
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
