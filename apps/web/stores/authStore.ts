import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SocialProviderT } from '@/types/auth';

export type AuthStateT = {
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
  provider: SocialProviderT | null;
  hasName: boolean;
  hasPreSchedule: boolean;
  isAllFree: boolean;
  notificationEnabled: boolean;
  isGoogleCalendarConnected: boolean;
  // 로그아웃 시 서버에 해제 요청을 보내야 해서 등록된 FCM 토큰 값을 들고 있는다.
  pushDeviceToken: string | null;
  setAuth: (auth: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    email: string;
    firstName: string;
    lastName: string;
    nickname: string;
    profileImageUrl: string | null;
    provider: SocialProviderT;
    hasName: boolean;
    hasPreSchedule: boolean;
    isAllFree: boolean;
    notificationEnabled: boolean;
    isGoogleCalendarConnected: boolean;
  }) => void;
  setAccessToken: (accessToken: string) => void;
  setName: (name: {
    firstName: string;
    lastName: string;
    nickname: string;
  }) => void;
  setProfile: (profile: {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    notificationEnabled?: boolean;
  }) => void;
  setPushDeviceToken: (pushDeviceToken: string | null) => void;
  setScheduleStatus: (status: {
    hasPreSchedule: boolean;
    isAllFree: boolean;
  }) => void;
  setGoogleCalendarConnected: (isGoogleCalendarConnected: boolean) => void;
  clear: () => void;
};

const INITIAL_AUTH_STATE = {
  userId: null,
  accessToken: null,
  refreshToken: null,
  email: null,
  firstName: null,
  lastName: null,
  nickname: null,
  profileImageUrl: null,
  provider: null,
  hasName: false,
  hasPreSchedule: false,
  isAllFree: false,
  notificationEnabled: false,
  isGoogleCalendarConnected: false,
  pushDeviceToken: null,
};

// 로그아웃/탈퇴처럼 사용자가 의도적으로 인증을 끝낸 경우를 표시해두는 플래그.
// clear() 호출로 accessToken이 지워지는 순간과 그 화면을 벗어나는 router 이동
// 사이에는 렌더링 타이밍상 미세한 간격이 있어서, 그 사이에 AuthGuard가 먼저
// 반응해 "지금 있던 페이지로 돌아오라"는 리다이렉트를 만들어버릴 수 있다 —
// 의도적으로 로그아웃/탈퇴하는 경우엔 그 리다이렉트가 필요 없으므로, 이 플래그로
// AuthGuard에게 이번 한 번은 건너뛰라고 미리 알려준다. React state가 아니라 순수
// 모듈 변수라 렌더 타이밍과 무관하게 즉시 반영된다.
let suppressNextAuthGuardRedirect = false;

export const suppressNextAuthGuardRedirectOnce = () => {
  suppressNextAuthGuardRedirect = true;
};

export const consumeAuthGuardRedirectSuppression = (): boolean => {
  const shouldSuppress = suppressNextAuthGuardRedirect;
  suppressNextAuthGuardRedirect = false;
  return shouldSuppress;
};

// 로그아웃/탈퇴 요청 자체가 실패하면(네트워크 오류 등) accessToken이 안 지워져
// AuthGuard가 이번엔 반응하지 않지만, 켜둔 플래그는 그대로 남는다 — 나중에 전혀
// 무관한 이유로 AuthGuard가 차단될 때 그 플래그가 잘못 소비되어, 그때는 꼭
// 필요한 리다이렉트 목적지 보존이 누락될 수 있다. 실패 시 반드시 꺼둔다.
export const clearAuthGuardRedirectSuppression = () => {
  suppressNextAuthGuardRedirect = false;
};

export const useAuthStore = create<AuthStateT>()(
  persist(
    (set) => ({
      ...INITIAL_AUTH_STATE,
      setAuth: (auth) => set(auth),
      setAccessToken: (accessToken) => set({ accessToken }),
      setName: (name) => set({ ...name, hasName: true }),
      setProfile: (profile) => set(profile),
      setPushDeviceToken: (pushDeviceToken) => set({ pushDeviceToken }),
      setScheduleStatus: (status) => set(status),
      setGoogleCalendarConnected: (isGoogleCalendarConnected) =>
        set({ isGoogleCalendarConnected }),
      clear: () => set(INITIAL_AUTH_STATE),
    }),
    {
      name: 'tripfit-auth',
      // 안전하게 저장해도 되는 필드만 명시(allow-list)한다 — refreshToken처럼 유효기간이
      // 길어 탈취 시 피해가 큰 값은 여기 없으면 자동으로 localStorage에서 제외된다.
      // accessToken은 만료가 짧아 새로고침 편의를 위해 남겨두되, 만료된 뒤에는 refreshToken이
      // 없어 재발급에 실패하고 자연스럽게 재로그인 화면으로 이동한다.
      partialize: (state) => ({
        userId: state.userId,
        accessToken: state.accessToken,
        email: state.email,
        firstName: state.firstName,
        lastName: state.lastName,
        nickname: state.nickname,
        profileImageUrl: state.profileImageUrl,
        provider: state.provider,
        hasName: state.hasName,
        hasPreSchedule: state.hasPreSchedule,
        isAllFree: state.isAllFree,
        notificationEnabled: state.notificationEnabled,
        isGoogleCalendarConnected: state.isGoogleCalendarConnected,
        pushDeviceToken: state.pushDeviceToken,
      }),
    },
  ),
);
