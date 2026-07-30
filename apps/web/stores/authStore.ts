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
  }) => void;
  setAccessToken: (accessToken: string) => void;
  setName: (name: {
    firstName: string;
    lastName: string;
    nickname: string;
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
};

export const useAuthStore = create<AuthStateT>()(
  persist(
    (set) => ({
      ...INITIAL_AUTH_STATE,
      setAuth: (auth) => set(auth),
      setAccessToken: (accessToken) => set({ accessToken }),
      setName: (name) => set({ ...name, hasName: true }),
      clear: () => set(INITIAL_AUTH_STATE),
    }),
    { name: 'tripfit-auth' },
  ),
);
