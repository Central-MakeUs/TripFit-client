'use client';

import { useState } from 'react';

import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import Input from '@/components/input';

type ProfileEditNameViewProps = {
  initialLastName: string;
  initialFirstName: string;
  onBack: () => void;
  onSave: (value: { lastName: string; firstName: string }) => void;
};

function ProfileEditNameView({
  initialLastName,
  initialFirstName,
  onBack,
  onSave,
}: ProfileEditNameViewProps) {
  const [lastName, setLastName] = useState(initialLastName);
  const [firstName, setFirstName] = useState(initialFirstName);

  const isValid = !!lastName.trim() && !!firstName.trim();

  const handleSave = () => {
    onSave({ lastName: lastName.trim(), firstName: firstName.trim() });
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="기본 정보 관리" onBack={onBack} />
      <div className="flex w-full flex-1 flex-col px-5 pt-3 pb-5">
        <h2 className="text-body-01 text-black pb-13">
          모든 여행방에서 이 이름으로 보여요
        </h2>

        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              label="성"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              label="이름"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full rounded-t-xl bg-white/80 backdrop-blur-[18px] sm:max-w-90">
          <CtaButtonGroup
            primaryText="저장하기"
            primaryColor="secondary"
            primaryDisabled={!isValid}
            onPrimaryClick={handleSave}
          />
        </div>
        <div aria-hidden className="h-[58px] w-full shrink-0" />
      </div>
    </div>
  );
}

export default ProfileEditNameView;
