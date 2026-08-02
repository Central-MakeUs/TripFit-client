'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { postGoogleCalendar } from '@/apis/googleCalendar';
import Button from '@/components/button';
import Spinner from '@/components/spinner';
import { useAuthStore } from '@/stores/authStore';
import {
  GOOGLE_CALENDAR_OAUTH_PROVIDER_KEY,
  getGoogleCalendarRedirectUri,
} from '@/utils/googleCalendarAuth';
import {
  consumeOAuthReturnPath,
  consumeOAuthState,
  consumePendingCalendarConnectResumeScreen,
  setCalendarConnectResumeScreen,
} from '@/utils/oauthState';

type ConnectStatusT = 'loading' | 'error';

// 저장해둔 returnPath는 "성공 시" 보여줄 화면(예: calendarConnectComplete)을 담고 있다 —
// 실패했는데 그대로 돌아가면 성공한 것처럼 완료 화면이 뜨니, resumeScreen을 재시도
// 화면(calendarConnectIntro)으로 바꿔치기해서 돌려보낸다.
const buildRetryPath = (returnPath: string): string => {
  const url = new URL(returnPath, window.location.origin);
  url.searchParams.set('resumeScreen', 'calendarConnectIntro');
  return `${url.pathname}${url.search}`;
};

function GoogleCalendarCallbackPage() {
  return (
    <Suspense>
      <GoogleCalendarCallbackHandler />
    </Suspense>
  );
}

function GoogleCalendarCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setGoogleCalendarConnected = useAuthStore(
    (state) => state.setGoogleCalendarConnected,
  );
  const hasRequestedRef = useRef(false);
  const [status, setStatus] = useState<ConnectStatusT>('loading');
  const returnPathRef = useRef('/');

  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    returnPathRef.current =
      consumeOAuthReturnPath(GOOGLE_CALENDAR_OAUTH_PROVIDER_KEY) ?? '/';

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const isStateValid = consumeOAuthState(
      GOOGLE_CALENDAR_OAUTH_PROVIDER_KEY,
      state,
    );

    // 사용자가 동의 화면에서 취소하면 code 대신 error 쿼리파라미터가 돌아온다.
    if (!code || !isStateValid) {
      // 이번 시도에 대한 pending 값을 버린다 — 안 지우면 resumeScreen 없이 시작된
      // 다음 연동 시도(예: 회원가입)가 이 오래된 값을 잘못 소비해 완료 화면이
      // 뜰 수 있다.
      consumePendingCalendarConnectResumeScreen();
      setStatus('error');
      return;
    }

    // 완료 화면은 이 페이지가 아니라 원래 화면(회원가입/마이페이지)이
    // initialScreen="calendarConnectComplete"로 복원해서 보여준다 — 성공하면
    // 바로 그 경로로 돌려보낸다.
    postGoogleCalendar({
      authorizationCode: code,
      redirectUri: getGoogleCalendarRedirectUri(),
    })
      .then(() => {
        setGoogleCalendarConnected(true);
        // 연동이 실제로 성공했을 때만 완료 화면 신호를 최종 적용한다 — 리다이렉트를
        // 시작할 때 미리 저장해둔 pending 값을 여기서 처음 소비/승격시킨다.
        const pendingResumeScreen = consumePendingCalendarConnectResumeScreen();
        if (pendingResumeScreen) {
          setCalendarConnectResumeScreen(pendingResumeScreen);
        }
        router.replace(returnPathRef.current);
      })
      .catch(() => {
        // 위와 동일한 이유로, code 교환 자체가 실패한 경우에도 pending 값을 버려야
        // 다음 시도가 오염되지 않는다.
        consumePendingCalendarConnectResumeScreen();
        setStatus('error');
      });
  }, [router, searchParams, setGoogleCalendarConnected]);

  if (status === 'error') {
    return (
      <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-2 px-5">
        <h1 className="text-title-01 text-black">연동에 실패했어요</h1>
        <p className="text-body-03 text-grey-500 mb-6">
          잠시 후 다시 시도해주세요
        </p>
        <Button
          text="확인"
          onClick={() => router.replace(buildRetryPath(returnPathRef.current))}
          className="w-full"
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 px-5">
      <Spinner className="size-8" />
      <p className="text-body-03 text-grey-500">
        구글 캘린더를 연동하고 있어요
      </p>
    </main>
  );
}

export default GoogleCalendarCallbackPage;
