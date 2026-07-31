import { SocialLoginTokenT } from '@/types/auth';
import { requestSocialToken } from '@/utils/nativeBridge';
import { createOAuthNonce, createOAuthState } from '@/utils/oauthState';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export const getGoogleRedirectUri = () =>
  `${window.location.origin}/auth/google/callback`;

// Google Identity Services(One Tap)는 FedCM 전환 과정에서 표시 자체가 막히는 경우가 많아
// 정석 OAuth 2.0 리다이렉트 플로우로 대체한다. response_type=code id_token(하이브리드
// 플로우)으로 요청하면 리다이렉트 즉시 ID 토큰(JWT)과 함께 authorization code도 같이
// 돌아온다 — 백엔드가 로그인 요청에 authorizationCode를 요구하기 때문이다(코드 자체의
// 교환은 백엔드가 Client Secret으로 처리하므로 프론트에서 별도 교환은 불필요하다).
// 이 함수 호출 이후 페이지가 이동하므로 반환하는 Promise는 resolve되지 않는다 —
// 실제 로그인 마무리는 /auth/google/callback 페이지에서 처리한다.
const redirectToGoogleAuthorize = async (): Promise<SocialLoginTokenT> => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('구글 로그인 설정이 올바르지 않습니다.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code id_token',
    scope: 'openid email profile',
    nonce: createOAuthNonce('GOOGLE'),
    state: createOAuthState('GOOGLE'),
    prompt: 'select_account',
  });

  window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;

  return new Promise<SocialLoginTokenT>(() => {});
};

export const requestGoogleIdToken = (): Promise<SocialLoginTokenT> =>
  requestSocialToken('GOOGLE', redirectToGoogleAuthorize);
