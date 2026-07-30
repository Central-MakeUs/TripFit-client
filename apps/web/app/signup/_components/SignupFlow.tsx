'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import { useAuthLogin } from '@/hooks/useAuthLogin';
import { useAuthStore } from '@/stores/authStore';
import { SocialProviderT } from '@/types/auth';
import { requestAppleIdToken } from '@/utils/appleAuth';
import { requestGoogleIdToken } from '@/utils/googleAuth';
import { requestKakaoToken } from '@/utils/kakaoAuth';
import { SOCIAL_LOGIN_CANCELLED } from '@/utils/nativeBridge';

import { usePatchOnboardingName } from '../_hooks/usePatchOnboardingName';
import ProfileNameStep from './ProfileNameStep';
import SocialLoginStep from './SocialLoginStep';

type StepT = 'social' | 'profile' | 'schedule';

const PROFILE_STEP_PROGRESS = 28.75;

function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [step, setStep] = useState<StepT>(accessToken ? 'profile' : 'social');

  // 카카오/구글은 리다이렉트 방식이라 로그인 완료 후 이 페이지가 새로 로드된다 —
  // 로그인이 이미 완료돼 accessToken이 저장돼 있으면(하이드레이션 이후 반영되는 경우 포함)
  // 소셜 로그인 단계를 건너뛰고 바로 이름 입력 단계로 진입한다
  useEffect(() => {
    if (accessToken) setStep('profile');
  }, [accessToken]);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  // 카카오/구글 리다이렉트 콜백이 실패하면 /signup?error=메시지 로 돌아온다 —
  // 콜백은 별도 페이지라 컴포넌트 상태를 못 들고 오므로 쿼리로 에러를 전달받는다
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error'),
  );

  const { authLoginMutation } = useAuthLogin();
  const { patchOnboardingNameMutation } = usePatchOnboardingName();

  const handleSelectSocial = async (provider: SocialProviderT) => {
    try {
      const result =
        provider === 'GOOGLE'
          ? await requestGoogleIdToken()
          : provider === 'KAKAO'
            ? await requestKakaoToken()
            : await requestAppleIdToken();

      authLoginMutation(
        { provider, ...result },
        {
          onSuccess: () => setStep('profile'),
          onError: (error) => setErrorMessage(error.message),
        },
      );
    } catch (error) {
      // 사용자가 로그인 자체를 취소한 건 에러가 아니므로 알럿 없이 조용히 넘어간다
      if (error instanceof Error && error.message === SOCIAL_LOGIN_CANCELLED) {
        return;
      }
      setErrorMessage(
        error instanceof Error ? error.message : '소셜 로그인에 실패했습니다.',
      );
    }
  };

  const handleSaveProfile = () => {
    patchOnboardingNameMutation(
      { lastName, firstName },
      {
        onSuccess: () => setStep('schedule'),
        onError: (error) => setErrorMessage(error.message),
      },
    );
  };

  const handleCloseError = () => {
    setErrorMessage(null);
    // URL에 남은 ?error= 쿼리를 지워서 새로고침해도 다시 뜨지 않게 한다
    if (searchParams.get('error')) router.replace('/signup');
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
          onSelectGoogle={() => handleSelectSocial('GOOGLE')}
          onSelectApple={() => handleSelectSocial('APPLE')}
          onSelectKakao={() => handleSelectSocial('KAKAO')}
        />
      )}

      {step === 'profile' && (
        <ProfileNameStep
          lastName={lastName}
          firstName={firstName}
          onChangeLastName={setLastName}
          onChangeFirstName={setFirstName}
          onNext={handleSaveProfile}
        />
      )}

      <AlertModal
        open={errorMessage !== null}
        onOpenChange={(open) => !open && handleCloseError()}
        variant="danger"
        title="문제가 발생했어요"
        description={errorMessage ?? ''}
        primaryText="확인"
        onPrimaryClick={handleCloseError}
      />
    </div>
  );
}

export default SignupFlow;
