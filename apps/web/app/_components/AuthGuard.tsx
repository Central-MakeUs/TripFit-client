'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  consumeAuthGuardRedirectSuppression,
  useAuthStore,
} from '@/stores/authStore';

import NotificationDeepLinkHandler from './NotificationDeepLinkHandler';
import NotificationReceivedHandler from './NotificationReceivedHandler';
import PushTokenRegistrar from './PushTokenRegistrar';

// 로그인 없이 접근 가능한 화면. 그 외 모든 화면은 로그인 화면(/signup)으로 리다이렉트된다.
// 소셜 로그인 리다이렉트 콜백은 전부 /auth/* 아래에 있어서 provider가 늘어나도 따로 추가할 필요 없다.
// 개인정보 처리방침은 App Store 심사·앱 미설치 사용자 등 로그인 여부와 무관하게
// 누구나 열람 가능해야 하는 페이지라 반드시 공개 상태여야 한다.
const PUBLIC_PATHS = ['/signup', '/onboarding', '/privacy-policy'];
const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth/');

type AuthGuardProps = {
  children: React.ReactNode;
};

// usePathname()은 useSearchParams()와 달리 정적 프리렌더에서도 Suspense 없이 안전하다.
// 공개 경로인지 여기서 먼저 갈라서, children이 useSearchParams()를 쓰는 Suspense 경계
// 안으로 절대 들어가지 않게 한다 — 예전엔 children이 그 경계 안에 있어서, 정적으로
// 프리렌더되는 라우트에서는(예: /onboarding, /signup, /privacy-policy) 그 경계 전체가
// 통째로 클라이언트 렌더링으로 넘어가 버려 서버 HTML에 콘텐츠가 하나도 없었다(구글
// OAuth 브랜딩 심사가 "홈페이지에 앱 목적 설명이 없다"고 반려한 원인). 공개 경로는
// isBlocked가 항상 false라 리다이렉트 로직 자체가 필요 없으므로, children을 곧장
// 서버 렌더링하고 인증 관련 부수효과만 별도 Suspense 경계 안에서 처리한다.
function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();

  if (isPublicPath(pathname)) {
    return (
      <>
        {children}
        <AuthGuardEffects />
      </>
    );
  }

  return (
    <Suspense fallback={null}>
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  );
}

// 로그인된 상태로 공개 경로를 열람할 수도 있으므로(예: 로그인한 채 /privacy-policy
// 열람), 푸시 토큰 등록·알림 처리 같은 인증 사용자 전용 부수효과는 공개 경로에서도
// hydration 이후에 마운트한다. children 렌더링과는 완전히 분리되어 있어 이 컴포넌트가
// 클라이언트 렌더링으로 넘어가도 children의 서버 HTML에는 영향이 없다.
function AuthGuardEffects() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  if (!hasHydrated) return null;

  return (
    <>
      <PushTokenRegistrar />
      <NotificationDeepLinkHandler />
      <NotificationReceivedHandler />
    </>
  );
}

// useSearchParams()는 정적으로 프리렌더되는 페이지(예: Next.js가 자동 생성하는
// /_not-found)에서 Suspense 경계 없이 쓰면 빌드가 실패한다 — 이 컴포넌트를 감싸
// 그 요구를 만족시킨다. 보호된 경로에서만 쓰이므로(공개 경로는 AuthGuard가 이
// 컴포넌트 자체를 렌더링하지 않는다) 이 경계가 클라이언트 렌더링으로 넘어가도
// 괜찮다 — 인증 여부를 모르면 어차피 아무것도 보여줄 수 없는 경로들이다.
function AuthGuardInner({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 초대 링크의 inviteCode처럼 쿼리스트링에 실린 값도 로그인 후 그대로
  // 이어져야 하는데, usePathname()은 쿼리를 포함하지 않아 이것만 쓰면
  // 리다이렉트 도중 유실된다 — 쿼리까지 합쳐 원래 경로를 재구성한다.
  const pathWithQuery = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasName = useAuthStore((state) => state.hasName);
  const [hasHydrated, setHasHydrated] = useState(false);

  // 서버 렌더링 시점에는 zustand의 persist API에 접근할 수 없으므로,
  // 브라우저에서만 실행되는 useEffect 안에서 하이드레이션 상태를 확인한다.
  useEffect(() => {
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  const isBlocked =
    hasHydrated &&
    !isPublicPath(pathname) &&
    (!accessToken || (!hasName && pathname !== '/signup'));

  useEffect(() => {
    if (!isBlocked) return;
    // 로그아웃/탈퇴처럼 사용자가 의도적으로 인증을 끝낸 직후라면, 방금 있던
    // 페이지로 돌아오라는 리다이렉트가 필요 없으므로 그냥 /signup으로만 보낸다.
    if (consumeAuthGuardRedirectSuppression()) {
      router.replace('/signup');
      return;
    }
    // 앱 진입점(스플래시 직후 첫 화면)에서 로그인이 아예 안 되어 있으면 로그인
    // 화면 대신 온보딩부터 보여준다 — accessToken은 있는데 hasName만 없는
    // 회원가입 중간 사용자는 대상이 아니다(온보딩이 아니라 /signup으로 이어서
    // 이름 입력 등 남은 가입 절차를 마쳐야 한다).
    if (pathname === '/' && !accessToken) {
      router.replace('/onboarding');
      return;
    }
    // 그 외의 경우(로그인 안 된 채 보호된 페이지 접근 등)는 로그인/회원가입 완료 후
    // 원래 가려던 페이지(초대 링크로 들어온 여행방 등)로 바로 이어질 수 있도록,
    // 지금 있던 경로를(쿼리스트링 포함) 쿼리로 들려보낸다.
    router.replace(`/signup?redirect=${encodeURIComponent(pathWithQuery)}`);
  }, [isBlocked, pathname, pathWithQuery, router, accessToken]);

  if (!hasHydrated || isBlocked) return null;

  return (
    <>
      <PushTokenRegistrar />
      <NotificationDeepLinkHandler />
      <NotificationReceivedHandler />
      {children}
    </>
  );
}

export default AuthGuard;
