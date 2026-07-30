export type SocialProviderT = 'GOOGLE' | 'KAKAO' | 'APPLE';

export type SocialLoginTokenT = {
  token: string;
  // 카카오는 이미 서버에서 code를 소비해 토큰으로 바꿔서 보내지 않고,
  // 애플은 탈퇴 시 provider revoke에 필요해 그대로 백엔드까지 전달한다.
  authorizationCode?: string;
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
};
