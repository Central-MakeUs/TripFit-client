export type SocialProviderT = 'GOOGLE' | 'KAKAO' | 'APPLE';

export type SocialLoginTokenT = {
  token: string;
  // 카카오는 이미 서버에서 code를 소비해 토큰으로 바꿔서 보내지 않고,
  // 애플은 탈퇴 시 provider revoke에 필요해 그대로 백엔드까지 전달한다.
  authorizationCode?: string;
  // 구글 웹 브라우저 플로우(response_type=code id_token)에서만 값이 있다 —
  // authorizationCode 발급 시 실제로 쓰인 redirect_uri로, 환경(로컬/운영)마다
  // origin이 달라 백엔드가 토큰 교환 시 이 값을 그대로 써야 발급받은 code와
  // 일치한다. 네이티브 앱 로그인은 이 필드 자체가 없다.
  redirectUri?: string;
};

export type UserSummaryT = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  profileImageUrl: string | null;
  provider: SocialProviderT;
  isGoogleCalendarConnected: boolean;
  hasPreSchedule: boolean;
  isAllFree: boolean;
  notificationEnabled: boolean;
};
