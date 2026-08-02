import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';

import { NativeSocialLoginResult, SocialLoginProvider } from '../types/bridge';

const GOOGLE_WEB_CLIENT_ID =
  '1015195106839-d7a9ec24nmlegell9aksgh0rks1r1rql.apps.googleusercontent.com';

const GOOGLE_IOS_CLIENT_ID =
  '1015195106839-6na06iqfihr97dg0u3lrrb1kn0hcr056.apps.googleusercontent.com';

// apps/web/utils/googleCalendarAuth.ts의 GOOGLE_CALENDAR_SCOPE와 동일한 값이어야 한다.
const GOOGLE_CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.freebusy';

// 사용자가 로그인 자체를 취소한 경우를 나타내는 값 — 웹 쪽은 이 메시지를 보면
// 에러 알럿을 띄우지 않고 조용히 원래 화면으로 돌아간다.
export const SOCIAL_LOGIN_CANCELLED = 'CANCELLED';

let isGoogleConfigured = false;

const ensureGoogleConfigured = () => {
  if (isGoogleConfigured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    // serverAuthCode(백엔드가 요구하는 authorizationCode)를 받으려면 필요하다 —
    // webClientId가 있어야 하고, 이게 꺼져 있으면 항상 null로 온다.
    offlineAccess: true,
  });
  isGoogleConfigured = true;
};

const requestGoogleToken = async (): Promise<NativeSocialLoginResult> => {
  ensureGoogleConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (response.type === 'cancelled') {
    throw new Error(SOCIAL_LOGIN_CANCELLED);
  }
  if (response.type !== 'success' || !response.data.idToken) {
    throw new Error('구글 로그인에 실패했습니다.');
  }
  // 백엔드가 구글 로그인 처리에 authorizationCode(serverAuthCode)를 요구하므로,
  // offlineAccess 설정 문제 등으로 이 값이 비어 있으면 로그인 요청 자체를
  // 보내지 않고 여기서 바로 실패시킨다.
  if (!response.data.serverAuthCode) {
    throw new Error('구글 로그인에 실패했습니다.');
  }
  return {
    token: response.data.idToken,
    authorizationCode: response.data.serverAuthCode,
  };
};

// 로그인과 별개로, 이미 로그인된 계정에 캘린더 읽기 권한만 추가로 동의받는 흐름이라
// 로그인 스코프(profile/email)엔 캘린더 스코프를 기본 포함하지 않는다 — 여기서만
// 스코프를 넓혀 재구성한 뒤 signIn을 다시 호출하면, 같은 계정에 대해 재로그인 없이
// 캘린더 권한에 대한 증분 동의 화면만 추가로 뜬다.
export const requestGoogleCalendarConnectCode = async (): Promise<string> => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    offlineAccess: true,
    scopes: [GOOGLE_CALENDAR_SCOPE],
  });
  isGoogleConfigured = true;

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (response.type === 'cancelled') {
    throw new Error(SOCIAL_LOGIN_CANCELLED);
  }
  if (response.type !== 'success' || !response.data.serverAuthCode) {
    throw new Error('구글 캘린더 연동에 실패했습니다.');
  }
  return response.data.serverAuthCode;
};

const requestKakaoToken = async (): Promise<NativeSocialLoginResult> => {
  try {
    const token = await kakaoLogin();
    return { token: token.accessToken };
  } catch (error) {
    // 카카오 네이티브 SDK는 사용자가 취소해도 별도 에러 코드 없이
    // "KakaoSDKCommon.SdkError 오류 0"이라는 메시지만 던진다(0 = 취소).
    if (error instanceof Error && error.message.includes('오류 0')) {
      throw new Error(SOCIAL_LOGIN_CANCELLED);
    }
    throw error;
  }
};

const requestAppleToken = async (): Promise<NativeSocialLoginResult> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('애플 로그인에 실패했습니다.');
    }
    return {
      token: credential.identityToken,
      // 탈퇴 시 애플 연동 해제(revoke)에 필요해 함께 보낸다.
      authorizationCode: credential.authorizationCode ?? undefined,
    };
  } catch (error) {
    // expo-apple-authentication은 취소 시 "The user canceled the
    // authorization attempt"라는 메시지의 예외를 던진다.
    if (error instanceof Error && /cancel/i.test(error.message)) {
      throw new Error(SOCIAL_LOGIN_CANCELLED);
    }
    throw error;
  }
};

export const requestNativeSocialLoginToken = (
  provider: SocialLoginProvider,
): Promise<NativeSocialLoginResult> => {
  switch (provider) {
    case 'GOOGLE':
      return requestGoogleToken();
    case 'KAKAO':
      return requestKakaoToken();
    case 'APPLE':
      return requestAppleToken();
  }
};
