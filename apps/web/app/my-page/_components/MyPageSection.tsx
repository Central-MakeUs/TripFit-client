'use client';

import { useState } from 'react';

import ModifyIcon from '@/assets/icons/modify.svg';
import Header from '@/components/header';
import Profile from '@/components/profile';
import Toggle from '@/components/toggle';

import { MOCK_USER } from '../_mocks/user';
import ProfileEditNameView from './ProfileEditNameView';
import WithdrawConfirmView from './WithdrawConfirmView';

type ModeT = 'view' | 'editName' | 'withdraw';

function MyPageSection() {
  const [mode, setMode] = useState<ModeT>('view');
  const [user, setUser] = useState(MOCK_USER);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const handleSaveName = ({
    lastName,
    firstName,
  }: {
    lastName: string;
    firstName: string;
  }) => {
    // TODO: 프로필 이름 저장 API 연동
    setUser((prev) => ({ ...prev, name: `${lastName}${firstName}` }));
    setMode('view');
  };

  const handleWithdraw = () => {
    // TODO: 회원 탈퇴 API 연동
    setMode('view');
  };

  if (mode === 'editName') {
    return (
      <ProfileEditNameView
        initialLastName={user.name.slice(0, 1)}
        initialFirstName={user.name.slice(1)}
        onBack={() => setMode('view')}
        onSave={handleSaveName}
      />
    );
  }

  if (mode === 'withdraw') {
    return (
      <WithdrawConfirmView
        onBack={() => setMode('view')}
        onWithdraw={handleWithdraw}
      />
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-grey-20">
      <Header variant="page" title="마이페이지" background="grey-20" />
      <div className="flex w-full flex-1 flex-col gap-2 px-5 py-3">
        <div className="flex w-full flex-col items-center gap-4 rounded-2xl border-b border-grey-50 bg-white px-3 pt-5 pb-3">
          <div className="flex w-full items-center gap-4">
            <Profile
              size="L"
              text={user.name.slice(1)}
              color={user.color}
              tone={user.tone}
            />
            <div className="flex flex-col">
              <span className="text-body-03 text-black">{user.name}</span>
              <span className="text-body-06 text-grey-500">{user.email}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMode('editName')}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-0.5 rounded-xl bg-grey-50 pl-3 pr-2"
          >
            <span className="text-caption-01 text-grey-600">수정하기</span>
            <ModifyIcon className="size-4 text-grey-600" />
          </button>
        </div>

        <div className="flex w-full items-center gap-1 rounded-2xl bg-white p-4">
          <span className="flex-1 text-body-05 text-black">알림 허용</span>
          <Toggle
            checked={isNotificationEnabled}
            onCheckedChange={setIsNotificationEnabled}
            aria-label="알림 허용"
          />
        </div>

        <button
          type="button"
          onClick={() => setMode('withdraw')}
          className="flex w-full cursor-pointer items-center rounded-2xl bg-white px-4 py-3"
        >
          <span className="text-body-06 text-red-300">탈퇴하기</span>
        </button>
      </div>
    </div>
  );
}

export default MyPageSection;
