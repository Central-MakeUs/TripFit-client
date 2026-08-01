import AlertModal from '@/components/alert-modal';

type PreScheduleRequiredModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function PreScheduleRequiredModal({
  open,
  onOpenChange,
  onConfirm,
}: PreScheduleRequiredModalProps) {
  return (
    <AlertModal
      open={open}
      onOpenChange={onOpenChange}
      title="사전 일정 입력이 필요해요"
      description={
        <>
          여행방에 입장하려면
          <br />
          본인 일정을 먼저 입력해주세요.
        </>
      }
      primaryText="확인"
      primaryColor="primary"
      onPrimaryClick={onConfirm}
    />
  );
}

export default PreScheduleRequiredModal;
