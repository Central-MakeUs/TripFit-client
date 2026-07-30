import { SocialLoginTokenT, SocialProviderT } from '@/types/auth';
import { isReactNativeWebView } from '@/utils/platform';

// apps/app/utils/socialLogin.ts의 SOCIAL_LOGIN_CANCELLED와 동일한 값이어야 한다 —
// 사용자가 로그인 자체를 취소했을 때 앱이 보내는 에러 메시지를 나타낸다.
export const SOCIAL_LOGIN_CANCELLED = 'CANCELLED';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

type NativeSocialLoginProviderT = SocialProviderT;

type NativeBridgeOutgoingMessageT = {
  type: 'SOCIAL_LOGIN_REQUEST';
  provider: NativeSocialLoginProviderT;
};

type NativeBridgeIncomingMessageT =
  | ({
      type: 'SOCIAL_LOGIN_SUCCESS';
      provider: NativeSocialLoginProviderT;
    } & SocialLoginTokenT)
  | {
      type: 'SOCIAL_LOGIN_ERROR';
      provider: NativeSocialLoginProviderT;
      message: string;
    };

const postMessageToNative = (message: NativeBridgeOutgoingMessageT) => {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
};

const parseIncomingMessage = (
  raw: unknown,
): NativeBridgeIncomingMessageT | null => {
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      (parsed.type === 'SOCIAL_LOGIN_SUCCESS' ||
        parsed.type === 'SOCIAL_LOGIN_ERROR')
    ) {
      return parsed as NativeBridgeIncomingMessageT;
    }
  } catch {
    // 앱이 보낸 다른 형식의 메시지는 무시한다
  }
  return null;
};

// RN WebView는 플랫폼에 따라 메시지를 window 또는 document에 실어 보내므로 둘 다 구독한다.
export const requestNativeSocialLogin = (
  provider: NativeSocialLoginProviderT,
): Promise<SocialLoginTokenT> =>
  new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const message = parseIncomingMessage(event.data);
      if (!message || message.provider !== provider) return;

      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as EventListener);

      if (message.type === 'SOCIAL_LOGIN_SUCCESS') {
        resolve({
          token: message.token,
          authorizationCode: message.authorizationCode,
        });
      } else {
        reject(new Error(message.message));
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as EventListener);
    postMessageToNative({ type: 'SOCIAL_LOGIN_REQUEST', provider });
  });

// kakaoAuth/googleAuth/appleAuth 공통 진입점 — 앱(WebView) 안에서는 네이티브 로그인을
// RN 쪽에 위임하고, 일반 브라우저에서는 각 provider의 리다이렉트 플로우로 로그인을 진행한다.
export const requestSocialToken = (
  provider: NativeSocialLoginProviderT,
  redirectToAuthorize: () => Promise<SocialLoginTokenT>,
): Promise<SocialLoginTokenT> =>
  isReactNativeWebView()
    ? requestNativeSocialLogin(provider)
    : redirectToAuthorize();
