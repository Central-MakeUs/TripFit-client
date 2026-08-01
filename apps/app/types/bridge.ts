export type SocialLoginProvider = 'GOOGLE' | 'KAKAO' | 'APPLE';

const SOCIAL_LOGIN_PROVIDERS: SocialLoginProvider[] = [
  'GOOGLE',
  'KAKAO',
  'APPLE',
];

export type NativeSocialLoginResult = {
  token: string;
  authorizationCode?: string;
};

export type PushDeviceType = 'ANDROID' | 'IOS';

export type NativePushTokenResult = {
  token: string;
  deviceType: PushDeviceType;
};

// landingType/tripId 값 자체는 백엔드가 FCM data payload에 실어 보내는 문자열이라
// 여기선 구체적인 union으로 제한하지 않고 그대로 전달한다.
export type PushLandingData = {
  id: string | null;
  landingType: string;
  tripId: string | null;
};

export type BridgeOutgoingMessage =
  | {
      type: 'SOCIAL_LOGIN_REQUEST';
      provider: SocialLoginProvider;
    }
  | {
      type: 'PUSH_TOKEN_REQUEST';
      requestId: string;
    }
  | {
      type: 'OPEN_EXTERNAL_URL';
      url: string;
    };

export type BridgeIncomingMessage =
  | {
      type: 'SOCIAL_LOGIN_SUCCESS';
      provider: SocialLoginProvider;
      token: string;
      // 탈퇴 시 애플 연동 해제(revoke)에 필요해 애플만 함께 보낸다.
      authorizationCode?: string;
    }
  | {
      type: 'SOCIAL_LOGIN_ERROR';
      provider: SocialLoginProvider;
      message: string;
    }
  | ({
      type: 'PUSH_TOKEN_READY';
      requestId: string;
    } & NativePushTokenResult)
  | {
      type: 'PUSH_TOKEN_ERROR';
      requestId: string;
      message: string;
    }
  | ({
      type: 'NOTIFICATION_OPENED';
    } & PushLandingData)
  | {
      type: 'NOTIFICATION_RECEIVED';
    };

// OPEN_EXTERNAL_URL은 지금 구글 캘린더 OAuth 동의 화면을 여는 용도로만 쓰인다.
// isWebOrigin은 메시지를 보낸 WebView가 우리 origin인지만 확인할 뿐, 그 origin
// 자체에 XSS가 있어 임의의 postMessage를 흉내 내는 경우까지는 막아주지 못한다 —
// url 값 자체가 https://accounts.google.com이 아니면 거부해, 그런 경우에도
// Linking.openURL로 임의의 URL(피싱 사이트, 다른 앱의 딥링크 등)을 열 수 없게 한다.
const ALLOWED_EXTERNAL_URL_HOSTS = ['accounts.google.com'];

const isAllowedExternalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      ALLOWED_EXTERNAL_URL_HOSTS.includes(parsed.hostname)
    );
  } catch {
    return false;
  }
};

export const parseBridgeMessage = (
  raw: string,
): BridgeOutgoingMessage | null => {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.type === 'SOCIAL_LOGIN_REQUEST' &&
      SOCIAL_LOGIN_PROVIDERS.includes(parsed.provider)
    ) {
      return parsed as BridgeOutgoingMessage;
    }
    if (
      parsed &&
      parsed.type === 'PUSH_TOKEN_REQUEST' &&
      typeof parsed.requestId === 'string'
    ) {
      return parsed as BridgeOutgoingMessage;
    }
    if (
      parsed &&
      parsed.type === 'OPEN_EXTERNAL_URL' &&
      typeof parsed.url === 'string' &&
      isAllowedExternalUrl(parsed.url)
    ) {
      return parsed as BridgeOutgoingMessage;
    }
  } catch {
    // 웹이 보낸 다른 형식의 메시지는 무시한다
  }
  return null;
};
