'use client';

import { Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

import { useSocialLoginCallback } from '@/hooks/useSocialLoginCallback';
import { SocialProviderT } from '@/types/auth';
import { exchangeKakaoCodeForToken } from '@/utils/kakaoAuth';

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

  if (!provider) {
    router.replace('/signup');
    return null;
  }

  return (
    <AuthCallbackForProvider provider={provider} searchParams={searchParams} />
  );
}

function AuthCallbackForProvider({
  provider,
  searchParams,
}: {
  provider: SocialProviderT;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  useSocialLoginCallback(provider, async () => {
    // 카카오는 인가 코드(code)를 쿼리로 돌려줘서 서버에서 토큰 교환이 필요하고,
    // 구글은 id_token을 URL 프래그먼트(#)로 바로 돌려주고,
    // 애플은 id_token을 POST body로 돌려줘서 서버 라우트(app/api/auth/apple/callback)가
    // 대신 받은 뒤 쿼리(appleToken)에 담아 이 페이지로 리다이렉트해준다.
    // 카카오 인가 코드는 우리 서버(/api/auth/kakao)에서 이미 토큰 교환에 소비했으므로,
    // 같은 코드를 백엔드에 authorizationCode로 또 보내면 "이미 사용된 코드"로 거부된다 — 보내지 않는다.
    if (provider === 'KAKAO') {
      const code = searchParams.get('code');
      if (!code) return null;
      const token = await exchangeKakaoCodeForToken(code);
      return { token };
    }
    if (provider === 'APPLE') {
      const appleToken = searchParams.get('appleToken');
      if (!appleToken) return null;
      const appleCode = searchParams.get('appleCode');
      return {
        token: appleToken,
        ...(appleCode ? { authorizationCode: appleCode } : {}),
      };
    }
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const idToken = hashParams.get('id_token');
    return idToken ? { token: idToken } : null;
  });

  return null;
}

export default AuthCallbackPage;
