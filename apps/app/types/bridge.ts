export type SocialLoginProvider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export type NativeSocialLoginResult = {
  token: string;
  authorizationCode?: string;
};

export type BridgeOutgoingMessage = {
  type: 'SOCIAL_LOGIN_REQUEST';
  provider: SocialLoginProvider;
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
    };

export const parseBridgeMessage = (
  raw: string,
): BridgeOutgoingMessage | null => {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.type === 'SOCIAL_LOGIN_REQUEST') {
      return parsed as BridgeOutgoingMessage;
    }
  } catch {
    // 웹이 보낸 다른 형식의 메시지는 무시한다
  }
  return null;
};
