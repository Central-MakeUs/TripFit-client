'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/authStore';

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

  const isBlocked =
    hasHydrated &&
    (!accessToken
      ? !isPublicPath(pathname)
      : !hasName && pathname !== '/signup');

  useEffect(() => {
    if (isBlocked) router.replace('/signup');
  }, [isBlocked, router]);

  if (!hasHydrated || isBlocked) return null;

  return <>{children}</>;
}

export default AuthGuard;
