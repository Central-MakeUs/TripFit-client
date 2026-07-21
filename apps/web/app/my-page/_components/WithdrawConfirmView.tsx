import ExclamationMarkIcon from '@/assets/icons/exclamation-mark.svg';
import WarningTriangleIcon from '@/assets/icons/warning-triangle.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';

type WithdrawConfirmViewProps = {
  onBack: () => void;
  onWithdraw: () => void;
};

function WithdrawConfirmView({ onBack, onWithdraw }: WithdrawConfirmViewProps) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="마이페이지" onBack={onBack} />
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-5">
        <div className="relative h-18 w-auto text-red-50">
          <WarningTriangleIcon className="h-18 w-auto" />
          <ExclamationMarkIcon className="absolute top-[65%] left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-red-300" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-headline-03 text-black">
            정말 탈퇴하시겠어요?
          </span>
          <span className="text-body-03 text-center text-grey-500">
            탈퇴하면 내가 만든
            <br />
            여행방이 모두 사라져요.
          </span>
        </div>
      </div>
      <CtaButtonGroup
        primaryText="탈퇴하기"
        primaryColor="secondary"
        onPrimaryClick={onWithdraw}
        secondaryText="취소"
        secondaryColor="secondary"
        secondaryVariant="button-horizontal"
        onSecondaryClick={onBack}
      />
    </div>
  );
}

export default WithdrawConfirmView;
