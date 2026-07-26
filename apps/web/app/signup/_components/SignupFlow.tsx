'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import BasicInfo from '@/components/basic-info';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';

import ProfileNameStep from './ProfileNameStep';
import SocialLoginStep from './SocialLoginStep';

type StepT = 'social' | 'profile' | 'schedule';

const PROFILE_STEP_PROGRESS = 28.75;

function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<StepT>('social');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');

  const handleSelectSocial = () => {
    // TODO: 소셜 로그인 API 연동
    setStep('profile');
  };

  if (step === 'schedule') {
    return (
      <BasicInfo
        allowSkip={false}
        initialScreen="calendarConnectIntro"
        calendarConnectTitle="기본 정보 입력"
        calendarConnectProgress={PROFILE_STEP_PROGRESS}
        calendarConnectContinuesToSchedule
        onExit={() => setStep('profile')}
        onComplete={() => {
          // TODO: 회원가입 완료(근무 일정/캘린더 연동 저장) API 연동
          router.push('/');
        }}
      />
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      {step === 'profile' && (
        <>
          <Header
            variant="page"
            title="프로필 설정"
            onBack={() => setStep('social')}
          />
          <div className="px-5 py-1">
            <ProgressBar size="sm" value={PROFILE_STEP_PROGRESS} />
          </div>
        </>
      )}

      {step === 'social' && (
        <SocialLoginStep
          onSelectGoogle={handleSelectSocial}
          onSelectApple={handleSelectSocial}
          onSelectKakao={handleSelectSocial}
        />
      )}

      {step === 'profile' && (
        <ProfileNameStep
          lastName={lastName}
          firstName={firstName}
          onChangeLastName={setLastName}
          onChangeFirstName={setFirstName}
          onNext={() => setStep('schedule')}
        />
      )}
    </div>
  );
}

export default SignupFlow;
