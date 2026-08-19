'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import { useGoogleCalendarConnect } from '@/hooks/useGoogleCalendarConnect';
import { usePostAuthLogin } from '@/hooks/usePostAuthLogin';
import { useAuthStore } from '@/stores/authStore';
import { SocialProviderT } from '@/types/auth';
import { requestAppleIdToken } from '@/utils/appleAuth';
import { requestGoogleIdToken } from '@/utils/googleAuth';
import { requestKakaoToken } from '@/utils/kakaoAuth';
import { SOCIAL_LOGIN_CANCELLED } from '@/utils/nativeBridge';
import { saveOAuthRedirectTarget } from '@/utils/oauthState';

import { usePatchOnboardingName } from '../_hooks/usePatchOnboardingName';
import ProfileNameStep from './ProfileNameStep';
import SocialLoginStep from './SocialLoginStep';

type StepT = 'social' | 'profile' | 'calendar';

// 프로필 설정/캘린더 연동까지는 하나의 단계로 묶어서 전부 25%로 보여준다.
const PROFILE_STEP_PROGRESS = 25;

function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasName = useAuthStore((state) => state.hasName);
  const [step, setStep] = useState<StepT>(
    accessToken && !hasName ? 'profile' : 'social',
  );
  // 캘린더 연동은 이 세션 안에서는 건너뛰어도 그냥 다음으로 넘어가지만(마이페이지에서
  // 언제든 다시 할 수 있으니 손해 없음), "이름 저장까지 마친 유저가 /signup에 새로
  // 들어온" 진짜 재진입이면 이 플로우 자체를 건너뛰고 홈으로 보낸다. hasName은 이름
  // 저장 성공 즉시 true가 되므로, 이 값만 보고 판단하면 지금 이 세션에서 막 캘린더
  // 단계로 넘어간 것도 "재진입"으로 오인해 그대로 홈으로 튕겨나간다 — 그래서 이번
  // 세션에서 이미 플로우를 진행 중인지를 별도로 기억해뒀다가, 그런 경우엔 재진입
  // 판정을 하지 않는다.
  const hasEnteredFlowRef = useRef(false);
  const {
    connectGoogleCalendar,
    isKakaoBrowserAlertOpen,
    closeKakaoBrowserAlert,
  } = useGoogleCalendarConnect();

  // 초대 링크 등으로 보호된 페이지에 접근하려다 로그인이 안 돼있어 여기로 온
  // 경우, AuthGuard가 원래 경로를 ?redirect=로 실어 보낸다 — 로그인/회원가입이
  // 끝나면 홈이 아니라 그 경로로 바로 이어준다. 외부 사이트로 새는 오픈 리다이렉트를
  // 막기 위해 우리 앱 내부의 상대 경로("/"로 시작)일 때만 신뢰한다.
  const rawRedirect = searchParams.get('redirect');
  const redirectTarget =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/';

  // 구글 캘린더 연동은 페이지 전체 리다이렉트(구글 OAuth) 왕복이 필요해 이 컴포넌트의
  // step 상태가 초기화된다 — 콜백이 이 쿼리로 "연동 완료 화면으로 돌아가야 하는지"를
  // 알려주면, 재진입 판정을 우회하고 그 화면부터 다시 시작한다.
  const resumeScreen = searchParams.get('resumeScreen');
  const buildCalendarConnectReturnPath = () => {
    const params = new URLSearchParams({
      resumeScreen: 'calendarConnectComplete',
    });
    if (rawRedirect) params.set('redirect', rawRedirect);
    return `/signup?${params.toString()}`;
  };

  // 카카오/구글은 리다이렉트 방식이라 로그인 완료 후 이 페이지가 새로 로드된다 —
  // 로그인이 이미 완료돼 accessToken이 저장돼 있으면(하이드레이션 이후 반영되는 경우 포함)
  // 소셜 로그인 단계를 건너뛰고 바로 이름 입력 단계로 진입한다.
  // 이미 이름까지 입력을 마친(hasName) 유저가 /signup으로 다시 들어온 경우는
  // 이름을 덮어쓰지 않도록 회원가입 플로우 자체를 건너뛰고 홈으로 보낸다 — 단, 캘린더
  // 연동 후 돌아온 재진입(resumeScreen 있음)은 예외로 캘린더 단계를 이어간다.
  useEffect(() => {
    if (!accessToken) return;
    if (hasName) {
      if (hasEnteredFlowRef.current) return;
      if (resumeScreen) {
        hasEnteredFlowRef.current = true;
        setStep('calendar');
        return;
      }
      router.replace(redirectTarget);
      return;
    }
    hasEnteredFlowRef.current = true;
    setStep('profile');
  }, [accessToken, hasName, router, redirectTarget, resumeScreen]);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  // 카카오/구글 리다이렉트 콜백이 실패하면 /signup?error=메시지 로 돌아온다 —
  // 콜백은 별도 페이지라 컴포넌트 상태를 못 들고 오므로 쿼리로 에러를 전달받는다
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error'),
  );

  const { postAuthLoginMutation } = usePostAuthLogin();
  const { patchOnboardingNameMutation } = usePatchOnboardingName();

  const handleConnectGoogleCalendar = async () => {
    try {
      return await connectGoogleCalendar(buildCalendarConnectReturnPath());
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '구글 캘린더 연동에 실패했어요.',
      );
      return false;
    }
  };

  const handleSelectSocial = async (provider: SocialProviderT) => {
    try {
      // 구글/카카오/애플 웹 로그인은 이 시점에 페이지가 완전히 떠나버려서(전체 페이지
      // 리다이렉트) 지금 갖고 있는 redirectTarget이 사라진다 — 콜백 처리가 끝난 뒤
      // 다시 꺼내 쓸 수 있도록 떠나기 직전에 저장해둔다.
      saveOAuthRedirectTarget(redirectTarget);

      const result =
        provider === 'GOOGLE'
          ? await requestGoogleIdToken()
          : provider === 'KAKAO'
            ? await requestKakaoToken()
            : await requestAppleIdToken();

      postAuthLoginMutation(
        { provider, ...result },
        {
          onSuccess: () => {
            // postAuthLoginMutation의 onSuccess(usePostAuthLogin 내부)가 먼저
            // 실행되어 hasName을 이미 최신값으로 반영해뒀지만, 여기서 구독 중인
            // hasName 변수는 이번 렌더 시점의 값이라 아직 갱신 전이다 — 재렌더를
            // 기다리지 않고 스토어에서 바로 최신값을 읽어야 한다.
            // 이미 이름까지 등록된 기존 유저가 로그인한 거라면 회원가입 절차 없이
            // 원래 가려던 곳(없으면 홈)으로 바로 보낸다.
            if (useAuthStore.getState().hasName) {
              router.replace(redirectTarget);
              return;
            }
            hasEnteredFlowRef.current = true;
            setStep('profile');
          },
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
        onSuccess: () => {
          hasEnteredFlowRef.current = true;
          setStep('calendar');
        },
        onError: (error) => setErrorMessage(error.message),
      },
    );
  };

  const handleCloseError = () => {
    setErrorMessage(null);
    // URL에 남은 ?error= 쿼리를 지워서 새로고침해도 다시 뜨지 않게 하되, redirect
    // 파라미터는 남겨서 로그인 재시도 후에도 원래 가려던 곳으로 이어지게 한다.
    if (searchParams.get('error')) {
      router.replace(
        rawRedirect
          ? `/signup?redirect=${encodeURIComponent(rawRedirect)}`
          : '/signup',
      );
    }
  };

  // 이미 이름까지 입력을 마친 유저가 재진입한 경우엔, 위 useEffect가 홈으로
  // 리다이렉트시키는 동안 잠깐이라도 회원가입 화면이 보이지 않도록 아무것도
  // 렌더하지 않는다. 이번 세션에서 막 이름 저장까지 마치고 캘린더 단계로
  // 넘어간 경우는 재진입이 아니므로 제외한다.
  if (accessToken && hasName && !hasEnteredFlowRef.current) return null;

  if (step === 'calendar') {
    return (
      <>
        <BasicInfo
          allowSkip
          initialScreen={
            resumeScreen === 'calendarConnectComplete'
              ? 'calendarConnectComplete'
              : 'calendarConnectIntro'
          }
          title="기본 정보 입력"
          calendarConnectTitle="기본 정보 입력"
          calendarConnectProgress={PROFILE_STEP_PROGRESS}
          onConnectGoogleCalendar={handleConnectGoogleCalendar}
          onExit={() => router.push(redirectTarget)}
          onComplete={() => router.push(redirectTarget)}
        />
        <AlertModal
          open={isKakaoBrowserAlertOpen}
          onOpenChange={(open) => !open && closeKakaoBrowserAlert()}
          title="다른 브라우저에서 열어주세요"
          description="하단의 공유 아이콘을 눌러 'Safari에서 열기'를 선택해주세요."
          primaryText="확인"
          onPrimaryClick={closeKakaoBrowserAlert}
        />
      </>
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
