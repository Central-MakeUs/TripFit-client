import CtaButtonGroup from '@/components/cta-button-group';
import Input from '@/components/input';

type ProfileNameStepProps = {
  lastName: string;
  firstName: string;
  onChangeLastName: (value: string) => void;
  onChangeFirstName: (value: string) => void;
  onNext: () => void;
};

function ProfileNameStep({
  lastName,
  firstName,
  onChangeLastName,
  onChangeFirstName,
  onNext,
}: ProfileNameStepProps) {
  const isValid = !!lastName.trim() && !!firstName.trim();

  return (
    <div className="flex w-full flex-1 flex-col px-5 pt-3 pb-5">
      <div className="flex flex-col gap-0.5 pb-13">
        <h2 className="text-body-01 text-black">
          반가워요!
          <br />
          이름을 알려주세요
        </h2>
        <p className="text-caption-01 text-grey-400">
          모든 여행방에서 이 이름으로 보여요
        </p>
      </div>

      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Input
            label="성"
            value={lastName}
            placeholder="홍"
            onChange={(event) => onChangeLastName(event.target.value)}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Input
            label="이름"
            value={firstName}
            placeholder="길동"
            onChange={(event) => onChangeFirstName(event.target.value)}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full rounded-t-xl bg-white/80 backdrop-blur-[18px] sm:max-w-90">
        <CtaButtonGroup
          primaryText="다음"
          primaryColor="secondary"
          primaryDisabled={!isValid}
          onPrimaryClick={onNext}
        />
      </div>
      <div aria-hidden className="h-[58px] w-full shrink-0" />
    </div>
  );
}

export default ProfileNameStep;
