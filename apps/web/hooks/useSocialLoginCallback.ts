'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { usePostAuthLogin } from '@/hooks/usePostAuthLogin';
import { SocialLoginTokenT, SocialProviderT } from '@/types/auth';
import { consumeOAuthRedirectTarget } from '@/utils/oauthState';

// 소셜 로그인 리다이렉트 콜백 페이지들의 공통 로직. provider마다 다른 건
// "토큰(또는 토큰으로 교환할 code)을 어떻게 얻는지"뿐이고, 얻은 토큰으로
// 로그인해서 리다이렉트하는 부분은 동일하다 — 실패하면 모두 /signup으로 돌아간다.
export const useSocialLoginCallback = (
  provider: SocialProviderT,
  getToken: () => SocialLoginTokenT | null | Promise<SocialLoginTokenT | null>,
) => {
  const router = useRouter();
  const { postAuthLoginMutation } = usePostAuthLogin();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    // 실패 시에도 저장해둔 원래 목적지를 함께 실어 보내야 한다 — 안 그러면
    // SignupFlow가 이 URL의 redirect 파라미터가 없다고 보고 목적지를 "/"로
    // 되돌린 뒤, 사용자가 재시도할 때 그 잘못된 값으로 sessionStorage를
    // 덮어써버려서 원래 목적지(예: 초대 링크로 들어온 여행방)가 완전히 사라진다.
    const replaceWithError = (message: string) => {
      const redirectTarget = encodeURIComponent(consumeOAuthRedirectTarget());
      router.replace(
        `/signup?redirect=${redirectTarget}&error=${encodeURIComponent(message)}`,
      );
    };

    Promise.resolve()
      .then(() => getToken())
      .then((result) => {
        if (!result) {
          replaceWithError('로그인 정보를 가져오지 못했습니다.');
          return;
        }
        postAuthLoginMutation(
          { provider, ...result },
          {
            // 로그인 시작 시 저장해둔 원래 목적지를 다시 /signup의 redirect
            // 쿼리로 실어 보낸다 — SignupFlow가 이 값을 보고 기존/신규 유저
            // 분기에 맞게 최종적으로 그 경로까지 이어준다.
            onSuccess: () =>
              router.replace(
                `/signup?redirect=${encodeURIComponent(consumeOAuthRedirectTarget())}`,
              ),
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
