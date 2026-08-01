import { SocialLoginTokenT, SocialProviderT } from '@/types/auth';
import { isReactNativeWebView } from '@/utils/platform';
import { randomUUID } from '@/utils/uuid';

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

export type PushDeviceTypeT = 'ANDROID' | 'IOS';

export type NativePushTokenResultT = {
  token: string;
  deviceType: PushDeviceTypeT;
};

// landingType 값 자체는 백엔드가 FCM data payload에 실어 보내는 문자열이라
// 여기선 구체적인 union으로 제한하지 않고 그대로 전달한다.
export type PushLandingDataT = {
  id: string | null;
  landingType: string;
  tripId: string | null;
};

type NativeBridgeOutgoingMessageT =
  | {
      type: 'SOCIAL_LOGIN_REQUEST';
      provider: NativeSocialLoginProviderT;
    }
  | {
      type: 'PUSH_TOKEN_REQUEST';
      requestId: string;
    }
  | {
      type: 'OPEN_EXTERNAL_URL';
      url: string;
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
    }
  | ({
      type: 'PUSH_TOKEN_READY';
      requestId: string;
    } & NativePushTokenResultT)
  | {
      type: 'PUSH_TOKEN_ERROR';
      requestId: string;
      message: string;
    }
  | ({
      type: 'NOTIFICATION_OPENED';
    } & PushLandingDataT)
  | {
      type: 'NOTIFICATION_RECEIVED';
    };

const postMessageToNative = (message: NativeBridgeOutgoingMessageT) => {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
};

// 구글은 앱 내장 WebView를 "제한된 브라우저"로 감지해 OAuth 동의 화면을 막는다 — 구글 캘린더
// 연동처럼 WebView 안에서 열면 안 되는 URL은 네이티브에 시스템 브라우저로 열어달라고 위임한다.
// 일반 브라우저에서는 네이티브 브릿지가 없으니 그냥 같은 탭에서 이동한다.
export const openExternalUrl = (url: string) => {
  if (isReactNativeWebView()) {
    postMessageToNative({ type: 'OPEN_EXTERNAL_URL', url });
    return;
  }
  window.location.href = url;
};

const INCOMING_MESSAGE_TYPES = [
  'SOCIAL_LOGIN_SUCCESS',
  'SOCIAL_LOGIN_ERROR',
  'PUSH_TOKEN_READY',
  'PUSH_TOKEN_ERROR',
  'NOTIFICATION_OPENED',
  'NOTIFICATION_RECEIVED',
];

const parseIncomingMessage = (
  raw: unknown,
): NativeBridgeIncomingMessageT | null => {
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && INCOMING_MESSAGE_TYPES.includes(parsed.type)) {
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
      if (
        !message ||
        (message.type !== 'SOCIAL_LOGIN_SUCCESS' &&
          message.type !== 'SOCIAL_LOGIN_ERROR') ||
        message.provider !== provider
      ) {
        return;
      }

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

// 네이티브가 브릿지 메시지 자체를 못 보내는 경우(RN 쪽 크래시, 메시지 유실 등)까지 대비한
// 상한선. OS 권한 다이얼로그에 사용자가 응답할 시간은 충분히 줘야 해서 넉넉하게 잡는다.
const PUSH_TOKEN_REQUEST_TIMEOUT_MS = 30_000;

// origin 검증이 불가능한 채널이라(RN WebView 브릿지는 event.origin/source로 네이티브 응답과
// 다른 출처의 메시지를 구분할 수 없다), 카카오/구글 SDK가 띄우는 iframe 등 제3자 스크립트가
// window.postMessage로 위조된 PUSH_TOKEN_READY를 먼저 보내면 그대로 수락되어 공격자의 토큰이
// 인증된 계정에 등록될 수 있었다 — 요청마다 예측 불가능한 requestId를 발급해 응답과 대조한다.
// RN WebView는 플랫폼에 따라 메시지를 window 또는 document에 실어 보내므로 둘 다 구독한다.
export const requestNativePushToken = (): Promise<NativePushTokenResultT> =>
  new Promise((resolve, reject) => {
    const requestId = randomUUID();

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as EventListener);
      clearTimeout(timeoutId);
    };

    const handleMessage = (event: MessageEvent) => {
      const message = parseIncomingMessage(event.data);
      if (
        !message ||
        (message.type !== 'PUSH_TOKEN_READY' &&
          message.type !== 'PUSH_TOKEN_ERROR') ||
        message.requestId !== requestId
      ) {
        return;
      }

      cleanup();

      if (message.type === 'PUSH_TOKEN_READY') {
        resolve({ token: message.token, deviceType: message.deviceType });
      } else {
        reject(new Error(message.message));
      }
    };

    // 네이티브가 끝내 응답하지 않으면 이 Promise가 영원히 pending 상태로 남아
    // 호출부(알림 토글 등)가 계속 잠긴 채로 남는다 — 시간 초과 시 명시적으로 reject한다.
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('알림 권한 요청이 응답하지 않았어요.'));
    }, PUSH_TOKEN_REQUEST_TIMEOUT_MS);

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as EventListener);
    postMessageToNative({ type: 'PUSH_TOKEN_REQUEST', requestId });
  });

// 로그인 요청과 달리 앱이 언제든(백그라운드 복귀·콜드 스타트) 먼저 보낼 수 있는
// 이벤트라 요청/응답이 아니라 구독 형태로 둔다. 구독 해제 함수를 반환한다.
export const onNativeNotificationOpened = (
  callback: (landing: PushLandingDataT) => void,
): (() => void) => {
  const handleMessage = (event: MessageEvent) => {
    const message = parseIncomingMessage(event.data);
    if (!message || message.type !== 'NOTIFICATION_OPENED') return;

    callback({
      id: message.id,
      landingType: message.landingType,
      tripId: message.tripId,
    });
  };

  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage as EventListener);

  return () => {
    window.removeEventListener('message', handleMessage);
    document.removeEventListener('message', handleMessage as EventListener);
  };
};

// 포그라운드로 도착한 푸시는 탭 여부와 무관하게 즉시 알려주는 이벤트라 구독 형태로 둔다.
// 구독 해제 함수를 반환한다.
export const onNativeNotificationReceived = (
  callback: () => void,
): (() => void) => {
  const handleMessage = (event: MessageEvent) => {
    const message = parseIncomingMessage(event.data);
    if (!message || message.type !== 'NOTIFICATION_RECEIVED') return;
    callback();
  };

  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage as EventListener);

  return () => {
    window.removeEventListener('message', handleMessage);
    document.removeEventListener('message', handleMessage as EventListener);
  };
};

// kakaoAuth/googleAuth/appleAuth 공통 진입점 — 앱(WebView) 안에서는 네이티브 로그인을
// RN 쪽에 위임하고, 일반 브라우저에서는 각 provider의 리다이렉트 플로우로 로그인을 진행한다.
export const requestSocialToken = (
  provider: NativeSocialLoginProviderT,
  redirectToAuthorize: () => Promise<SocialLoginTokenT>,
): Promise<SocialLoginTokenT> =>
  isReactNativeWebView()
    ? requestNativeSocialLogin(provider)
    : redirectToAuthorize();
