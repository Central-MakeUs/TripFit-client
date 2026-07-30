import { SocialLoginTokenT } from '@/types/auth';
import { loadExternalScript } from '@/utils/loadExternalScript';
import { requestSocialToken } from '@/utils/nativeBridge';

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => void;
      };
    };
  }
}

const APPLE_SDK_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

const loadAppleSdk = (): Promise<void> =>
  loadExternalScript(
    APPLE_SDK_SRC,
    () => !!window.AppleID,
    '애플 로그인 스크립트를 불러오지 못했습니다.',
  );

export const getAppleRedirectUri = () =>
  `${window.location.origin}/api/auth/apple/callback`;

// 애플 JS SDK는 scope에 name/email이 포함되면 팝업이든 리다이렉트든 상관없이
// id_token을 GET 쿼리가 아니라 POST body(form_post)로 돌려준다 — 클라이언트에서
// 직접 읽을 수 없으므로 이를 받아주는 서버 라우트(app/api/auth/apple/callback)가
// 대신 처리해서 /signup으로 리다이렉트해준다. 이 함수 호출 이후 페이지가 이동하므로
// 반환하는 Promise는 resolve되지 않는다.
const redirectToAppleSignIn = async (): Promise<SocialLoginTokenT> => {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('애플 로그인 설정이 올바르지 않습니다.');
  }

  await loadAppleSdk();

  window.AppleID!.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: getAppleRedirectUri(),
    usePopup: false,
  });

  window.AppleID!.auth.signIn();

  return new Promise<SocialLoginTokenT>(() => {});
};

export const requestAppleIdToken = (): Promise<SocialLoginTokenT> =>
  requestSocialToken('APPLE', redirectToAppleSignIn);
