import { SocialLoginTokenT } from '@/types/auth';
import { loadExternalScript } from '@/utils/loadExternalScript';
import { requestSocialToken } from '@/utils/nativeBridge';

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        authorize: (options: {
          redirectUri: string;
          throughTalk?: boolean;
        }) => void;
      };
    };
  }
}

const KAKAO_SDK_SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

export const getKakaoRedirectUri = () =>
  `${window.location.origin}/auth/kakao/callback`;

const loadKakaoSdk = (): Promise<void> =>
  loadExternalScript(
    KAKAO_SDK_SRC,
    () => !!window.Kakao,
    '카카오 로그인 스크립트를 불러오지 못했습니다.',
  );

// 카카오 JS SDK는 Kakao.Auth.login() 대신 Kakao.Auth.authorize()만 제공한다 — 팝업이 아니라
// 페이지 전체를 카카오 로그인 화면으로 이동시키고, 로그인 완료 후 redirectUri로 인가 코드(code)를
// 담아 돌아온다. 이 함수 호출 이후 페이지가 이동하므로 반환하는 Promise는 resolve되지 않는다 —
// 실제 로그인 마무리는 /auth/kakao/callback 페이지에서 처리한다.
const redirectToKakaoAuthorize = async (): Promise<SocialLoginTokenT> => {
  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!jsKey) {
    throw new Error('카카오 로그인 설정이 올바르지 않습니다.');
  }

  await loadKakaoSdk();

  if (!window.Kakao!.isInitialized()) {
    window.Kakao!.init(jsKey);
  }

  window.Kakao!.Auth.authorize({
    redirectUri: getKakaoRedirectUri(),
    // 카카오톡 앱으로의 전환 시도를 끄고 항상 웹 로그인 폼으로 바로 이동한다
    throughTalk: false,
  });

  return new Promise<SocialLoginTokenT>(() => {});
};

// /auth/kakao/callback 페이지가 카카오에게서 받은 인가 코드(code)를 실제 액세스 토큰으로 교환한다.
// Client Secret이 필요한 교환 자체는 우리 서버(app/api/auth/[provider]/callback)에서 대신 처리한다 —
// Client Secret은 절대 브라우저에 노출되면 안 되기 때문이다.
export const exchangeKakaoCodeForToken = async (
  code: string,
): Promise<string> => {
  const response = await fetch('/api/auth/kakao/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri: getKakaoRedirectUri() }),
  });

  if (!response.ok) {
    throw new Error('카카오 로그인에 실패했습니다.');
  }

  const data: { accessToken: string } = await response.json();
  return data.accessToken;
};

export const requestKakaoToken = (): Promise<SocialLoginTokenT> =>
  requestSocialToken('KAKAO', redirectToKakaoAuthorize);
