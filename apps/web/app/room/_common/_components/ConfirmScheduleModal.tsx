import CalendarMonthIcon from '@/assets/icons/calendar-month.svg';
import AlertModal from '@/components/alert-modal';

type ConfirmScheduleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function ConfirmScheduleModal({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmScheduleModalProps) {
  return (
    <AlertModal
      open={open}
      onOpenChange={onOpenChange}
      icon={<CalendarMonthIcon className="h-6 w-auto" />}
      title="입력하신 일정을 확인해주세요"
      description={
        <>
          이전에 입력한 일정에
          <br />
          변경 사항이 있다면 수정해주세요.
        </>
      }
      secondaryText="변경된게 없어요"
      onSecondaryClick={onConfirm}
      primaryText="수정하기"
      primaryColor="primary"
      onPrimaryClick={onConfirm}
    />
  );
}

export default ConfirmScheduleModal;
