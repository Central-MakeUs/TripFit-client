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

export type BridgeOutgoingMessage =
  | {
      type: 'SOCIAL_LOGIN_REQUEST';
      provider: SocialLoginProvider;
    }
  | {
      type: 'PUSH_TOKEN_REQUEST';
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
    } & NativePushTokenResult)
  | {
      type: 'PUSH_TOKEN_ERROR';
      message: string;
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
    if (parsed && parsed.type === 'PUSH_TOKEN_REQUEST') {
      return parsed as BridgeOutgoingMessage;
    }
  } catch {
    // 웹이 보낸 다른 형식의 메시지는 무시한다
  }
  return null;
};
