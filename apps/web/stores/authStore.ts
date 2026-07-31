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
  setScheduleStatus: (status: {
    hasPreSchedule: boolean;
    isAllFree: boolean;
  }) => void;
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
};

export const useAuthStore = create<AuthStateT>()(
  persist(
    (set) => ({
      ...INITIAL_AUTH_STATE,
      setAuth: (auth) => set(auth),
      setAccessToken: (accessToken) => set({ accessToken }),
      setName: (name) => set({ ...name, hasName: true }),
      setProfile: (profile) => set(profile),
      setScheduleStatus: (status) => set(status),
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
      }),
    },
  ),
);
