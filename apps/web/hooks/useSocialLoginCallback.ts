'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthLogin } from '@/hooks/useAuthLogin';
import { SocialLoginTokenT, SocialProviderT } from '@/types/auth';

// 소셜 로그인 리다이렉트 콜백 페이지들의 공통 로직. provider마다 다른 건
// "토큰(또는 토큰으로 교환할 code)을 어떻게 얻는지"뿐이고, 얻은 토큰으로
// 로그인해서 리다이렉트하는 부분은 동일하다 — 실패하면 모두 /signup으로 돌아간다.
export const useSocialLoginCallback = (
  provider: SocialProviderT,
  getToken: () => SocialLoginTokenT | null | Promise<SocialLoginTokenT | null>,
) => {
  const router = useRouter();
  const { authLoginMutation } = useAuthLogin();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const replaceWithError = (message: string) => {
      router.replace(`/signup?error=${encodeURIComponent(message)}`);
    };

    Promise.resolve(getToken())
      .then((result) => {
        if (!result) {
          replaceWithError('로그인 정보를 가져오지 못했습니다.');
          return;
        }
        authLoginMutation(
          { provider, ...result },
          {
            onSuccess: () => router.replace('/signup'),
            onError: (error) => replaceWithError(error.message),
          },
        );
      })
      .catch((error) => {
        replaceWithError(
          error instanceof Error
            ? error.message
            : '소셜 로그인에 실패했습니다.',
        );
      });
    // getToken은 각 콜백 페이지에서 렌더마다 새로 만들어지는 클로저라 의존성에 넣으면
    // hasRequestedRef 가드가 있어도 불필요하게 재평가된다. 최초 1회만 실행하면 되므로 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);
};
