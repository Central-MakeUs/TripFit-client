'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

import { useSocialLoginCallback } from '@/hooks/useSocialLoginCallback';
import { SocialProviderT } from '@/types/auth';
import { getGoogleRedirectUri } from '@/utils/googleAuth';
import { exchangeKakaoCodeForToken } from '@/utils/kakaoAuth';
import { consumeOAuthNonce, consumeOAuthState } from '@/utils/oauthState';

const PROVIDER_MAP: Record<string, SocialProviderT> = {
  kakao: 'KAKAO',
  google: 'GOOGLE',
  apple: 'APPLE',
};

function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackHandler />
    </Suspense>
  );
}

function AuthCallbackHandler() {
  const router = useRouter();
  const { provider: providerParam } = useParams<{ provider: string }>();
  const searchParams = useSearchParams();
  const provider = PROVIDER_MAP[providerParam];

  useEffect(() => {
    if (!provider) router.replace('/signup');
  }, [provider, router]);

  if (!provider) return null;

  return (
    <AuthCallbackForProvider provider={provider} searchParams={searchParams} />
  );
}

type AuthCallbackForProviderProps = {
  provider: SocialProviderT;
  searchParams: ReturnType<typeof useSearchParams>;
};

function AuthCallbackForProvider({
  provider,
  searchParams,
}: AuthCallbackForProviderProps) {
  useSocialLoginCallback(provider, async () => {
    // 카카오는 인가 코드(code)를 쿼리로 돌려줘서 서버에서 토큰 교환이 필요하고,
    // 구글은 하이브리드 플로우(code id_token)라 id_token과 authorization code를
    // URL 프래그먼트(#)로 함께 돌려주고(code 교환은 백엔드가 처리),
    // 애플은 id_token을 POST body로 돌려줘서 서버 라우트(app/api/auth/apple/callback)가
    // HttpOnly 쿠키에 담아둔 뒤 이 페이지가 GET 요청으로 한 번만 꺼내간다 — id_token/code를
    // URL 쿼리파라미터에 실으면 브라우저 히스토리 등으로 새어나갈 수 있어서다.
    // 각 provider마다 로그인 시작 시 발급해둔 state를 돌아온 값과 대조해 CSRF를 방지하고,
    // 구글/애플은 nonce도 id_token payload와 대조해 재생 공격을 방지한다.
    // 카카오 인가 코드는 우리 서버(/api/auth/kakao)에서 이미 토큰 교환에 소비했으므로,
    // 같은 코드를 백엔드에 authorizationCode로 또 보내면 "이미 사용된 코드"로 거부된다 — 보내지 않는다.
    if (provider === 'KAKAO') {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      if (!code || !consumeOAuthState('KAKAO', state)) return null;
      const token = await exchangeKakaoCodeForToken(code);
      return { token };
    }
    if (provider === 'APPLE') {
      const state = searchParams.get('state');
      if (!consumeOAuthState('APPLE', state)) return null;

      const response = await fetch('/api/auth/apple/callback');
      if (!response.ok) return null;
      const data: { idToken: string; code?: string } = await response.json();
      if (!consumeOAuthNonce('APPLE', data.idToken)) return null;

      return {
        token: data.idToken,
        ...(data.code ? { authorizationCode: data.code } : {}),
      };
    }
    // 하이브리드 플로우(response_type=code id_token)라서 id_token과 authorization
    // code가 같은 프래그먼트에 함께 돌아온다 — code 자체의 교환은 백엔드가 한다.
    // redirectUri는 그 code를 발급받을 때 실제로 쓴 값(환경마다 origin이 달라 동적)이라,
    // 백엔드가 토큰 교환 시 이 값을 그대로 써야 code와 일치해 정상 교환된다.
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const idToken = hashParams.get('id_token');
    const code = hashParams.get('code');
    const state = hashParams.get('state');
    if (!idToken || !consumeOAuthState('GOOGLE', state)) return null;
    if (!consumeOAuthNonce('GOOGLE', idToken)) return null;
    return {
      token: idToken,
      ...(code
        ? { authorizationCode: code, redirectUri: getGoogleRedirectUri() }
        : {}),
    };
  });

  return null;
}

export default AuthCallbackPage;
