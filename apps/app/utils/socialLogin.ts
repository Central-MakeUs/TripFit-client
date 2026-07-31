import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';

import { NativeSocialLoginResult, SocialLoginProvider } from '../types/bridge';

const GOOGLE_WEB_CLIENT_ID =
  '1015195106839-d7a9ec24nmlegell9aksgh0rks1r1rql.apps.googleusercontent.com';

const GOOGLE_IOS_CLIENT_ID =
  '1015195106839-6na06iqfihr97dg0u3lrrb1kn0hcr056.apps.googleusercontent.com';

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
  return {
    token: response.data.idToken,
    authorizationCode: response.data.serverAuthCode ?? undefined,
  };
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
