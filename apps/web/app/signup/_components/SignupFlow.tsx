'use client';

import { useEffect, useRef, useState } from 'react';
import { addYears, format, subDays } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import { BasicInfoValue } from '@/components/basic-info/basicInfo.const';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import { useGetScheduleCalendar } from '@/hooks/useGetScheduleCalendar';
import { usePatchPersonalSchedule } from '@/hooks/usePatchPersonalSchedule';
import { usePostAuthLogin } from '@/hooks/usePostAuthLogin';
import { useRefreshScheduleStatus } from '@/hooks/useRefreshScheduleStatus';
import { useSaveRegularSchedule } from '@/hooks/useSaveRegularSchedule';
import { useAuthStore } from '@/stores/authStore';
import { SocialProviderT } from '@/types/auth';
import { IndividualScheduleValueT } from '@/types/schedule';
import { requestAppleIdToken } from '@/utils/appleAuth';
import { requestGoogleIdToken } from '@/utils/googleAuth';
import { requestKakaoToken } from '@/utils/kakaoAuth';
import { mapScheduleCalendarToIndividualScheduleValue } from '@/utils/mapScheduleCalendar';
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
  const hasName = useAuthStore((state) => state.hasName);
  const [step, setStep] = useState<StepT>(
    accessToken && !hasName ? 'profile' : 'social',
  );
  // 캘린더 연동/사전 일정 입력은 이 세션 안에서는 건너뛰어도 그냥 다음으로
  // 넘어가지만(마이페이지·방 생성/입장에서 언제든 다시 할 수 있으니 손해 없음),
  // "이름 저장까지 마친 유저가 /signup에 새로 들어온" 진짜 재진입이면 이 플로우
  // 자체를 건너뛰고 홈으로 보낸다. hasName은 이름 저장 성공 즉시 true가 되므로,
  // 이 값만 보고 판단하면 지금 이 세션에서 막 스케줄 단계로 넘어간 것도 "재진입"으로
  // 오인해 그대로 홈으로 튕겨나간다 — 그래서 이번 세션에서 이미 플로우를 진행
  // 중인지를 별도로 기억해뒀다가, 그런 경우엔 재진입 판정을 하지 않는다.
  const hasEnteredFlowRef = useRef(false);

  // 카카오/구글은 리다이렉트 방식이라 로그인 완료 후 이 페이지가 새로 로드된다 —
  // 로그인이 이미 완료돼 accessToken이 저장돼 있으면(하이드레이션 이후 반영되는 경우 포함)
  // 소셜 로그인 단계를 건너뛰고 바로 이름 입력 단계로 진입한다.
  // 이미 이름까지 입력을 마친(hasName) 유저가 /signup으로 다시 들어온 경우는
  // 이름을 덮어쓰지 않도록 회원가입 플로우 자체를 건너뛰고 홈으로 보낸다.
  useEffect(() => {
    if (!accessToken) return;
    if (hasName) {
      if (hasEnteredFlowRef.current) return;
      router.replace('/');
      return;
    }
    hasEnteredFlowRef.current = true;
    setStep('profile');
  }, [accessToken, hasName, router]);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  // 카카오/구글 리다이렉트 콜백이 실패하면 /signup?error=메시지 로 돌아온다 —
  // 콜백은 별도 페이지라 컴포넌트 상태를 못 들고 오므로 쿼리로 에러를 전달받는다
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error'),
  );

  const { postAuthLoginMutation } = usePostAuthLogin();
  const { patchOnboardingNameMutation } = usePatchOnboardingName();
  const { saveRegularSchedule } = useSaveRegularSchedule({ enabled: false });
  const { refreshScheduleStatus } = useRefreshScheduleStatus();
  const { patchPersonalScheduleMutation } = usePatchPersonalSchedule();

  const today = new Date();
  const { refetchScheduleCalendar } = useGetScheduleCalendar({
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(subDays(addYears(today, 2), 1), 'yyyy-MM-dd'),
  });

  const handleSaveRegularSchedule = async (value: BasicInfoValue) => {
    try {
      await saveRegularSchedule(value);
      await refreshScheduleStatus();
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
  };

  const handleBeforeIndividualSchedule = async () => {
    const { data } = await refetchScheduleCalendar();
    if (!data) return undefined;
    return mapScheduleCalendarToIndividualScheduleValue(data.days);
  };

  const handleSaveIndividualSchedule = async (
    value: BasicInfoValue,
    individualScheduleBackdrop: IndividualScheduleValueT,
  ) => {
    try {
      if (Object.keys(value.individualSchedule).length > 0) {
        await patchPersonalScheduleMutation({
          value: value.individualSchedule,
          mergedStatus: individualScheduleBackdrop,
        });
        await refreshScheduleStatus();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
    return true;
  };

  const handleSelectSocial = async (provider: SocialProviderT) => {
    try {
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
            // 바로 홈으로 보낸다.
            if (useAuthStore.getState().hasName) {
              router.replace('/');
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
          setStep('schedule');
        },
        onError: (error) => setErrorMessage(error.message),
      },
    );
  };

  const handleCloseError = () => {
    setErrorMessage(null);
    // URL에 남은 ?error= 쿼리를 지워서 새로고침해도 다시 뜨지 않게 한다
    if (searchParams.get('error')) router.replace('/signup');
  };

  // 이미 이름까지 입력을 마친 유저가 재진입한 경우엔, 위 useEffect가 홈으로
  // 리다이렉트시키는 동안 잠깐이라도 회원가입 화면이 보이지 않도록 아무것도
  // 렌더하지 않는다. 이번 세션에서 막 이름 저장까지 마치고 스케줄 단계로
  // 넘어간 경우는 재진입이 아니므로 제외한다.
  if (accessToken && hasName && !hasEnteredFlowRef.current) return null;

  if (step === 'schedule') {
    return (
      <BasicInfo
        allowSkip
        initialScreen="calendarConnectIntro"
        calendarConnectTitle="기본 정보 입력"
        calendarConnectProgress={PROFILE_STEP_PROGRESS}
        calendarConnectContinuesToSchedule
        endsAtIncludeHalfDayHoliday
        confirmDirectInputOnNoRegularSchedule
        onExit={() => setStep('profile')}
        onRegularScheduleNext={handleSaveRegularSchedule}
        onBeforeIndividualSchedule={handleBeforeIndividualSchedule}
        onBeforeComplete={handleSaveIndividualSchedule}
        onComplete={() => router.push('/')}
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
