'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

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

function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasName = useAuthStore((state) => state.hasName);
  const [hasHydrated, setHasHydrated] = useState(false);

  // 서버 렌더링 시점에는 zustand의 persist API에 접근할 수 없으므로,
  // 브라우저에서만 실행되는 useEffect 안에서 하이드레이션 상태를 확인한다.
  useEffect(() => {
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  // isPublicPath는 로그인 여부와 무관하게 항상 예외여야 한다 — 특히 /auth/* 콜백
  // 페이지는 소셜 로그인 처리 도중 accessToken은 이미 생겼지만 hasName은 아직
  // false인 순간이 있는데, 이 체크가 accessToken 분기 안에만 있으면 그 찰나에
  // AuthGuard가 콜백 페이지 자신의 경로(pathname)로 또 리다이렉트를 걸어버려
  // 원래 저장해둔 목적지를 덮어써버린다(콜백 페이지 자체가 최종 리다이렉트를
  // 이미 책임지고 처리하므로 AuthGuard가 끼어들 필요가 없다).
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
    // 그 외의 경우(로그인 안 된 채 보호된 페이지 접근 등)는 로그인/회원가입 완료 후
    // 원래 가려던 페이지(초대 링크로 들어온 여행방 등)로 바로 이어질 수 있도록,
    // 지금 있던 경로를 쿼리로 들려보낸다.
    router.replace(`/signup?redirect=${encodeURIComponent(pathname)}`);
  }, [isBlocked, pathname, router]);

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
