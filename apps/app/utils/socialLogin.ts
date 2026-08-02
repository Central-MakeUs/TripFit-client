import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';

import { NativeSocialLoginResult, SocialLoginProvider } from '../types/bridge';

const GOOGLE_WEB_CLIENT_ID =
  '1015195106839-d7a9ec24nmlegell9aksgh0rks1r1rql.apps.googleusercontent.com';

const GOOGLE_IOS_CLIENT_ID =
  '1015195106839-6na06iqfihr97dg0u3lrrb1kn0hcr056.apps.googleusercontent.com';

// apps/web의 NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID와 동일한 값이어야 한다 — 로그인과
// 캘린더 연동은 백엔드가 서로 다른 시크릿으로 code를 교환하는 별도의 구글 OAuth
// 클라이언트를 쓴다. 로그인용 webClientId(GOOGLE_WEB_CLIENT_ID)로 발급받은 code를
// 캘린더 연동 엔드포인트로 보내면 백엔드가 다른 클라이언트로 교환을 시도해 구글이
// invalid_client로 거절한다(GOOGLE_CALENDAR_CONNECT_FAILED).
const GOOGLE_CALENDAR_WEB_CLIENT_ID =
  '1015195106839-0atgsuv6l8coekallcomuseq83s8kl4j.apps.googleusercontent.com';

// apps/web/utils/googleCalendarAuth.ts의 GOOGLE_CALENDAR_SCOPE와 동일한 값이어야 한다.
const GOOGLE_CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.freebusy';

// 사용자가 로그인 자체를 취소한 경우를 나타내는 값 — 웹 쪽은 이 메시지를 보면
// 에러 알럿을 띄우지 않고 조용히 원래 화면으로 돌아간다.
export const SOCIAL_LOGIN_CANCELLED = 'CANCELLED';

// serverAuthCode(백엔드가 요구하는 authorizationCode)를 받으려면 offlineAccess와
// webClientId가 필요하다 — 이게 꺼져 있으면 항상 null로 온다. 로그인용 기본 스코프에는
// 캘린더 권한을 포함하지 않는다.
const BASE_GOOGLE_SIGNIN_CONFIG = {
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  offlineAccess: true,
};

let isGoogleConfigured = false;

const ensureGoogleConfigured = () => {
  if (isGoogleConfigured) return;
  GoogleSignin.configure(BASE_GOOGLE_SIGNIN_CONFIG);
  isGoogleConfigured = true;
};

// GoogleSignin.configure()는 모듈 전역(및 네이티브 SDK) 상태를 바꾸는 공유 자원이다 —
// 로그인과 캘린더 연동(그 안의 configure→OAuth→restore 사이클) 요청이 동시에 실행되면,
// 한쪽이 진행 중인 configure를 다른 쪽의 restore가 덮어써 엉뚱한 클라이언트로 code가
// 발급될 수 있다. 아래 큐로 이 파일의 Google 관련 진입점을 전부 직렬화해 항상 하나씩만
// 실행되게 한다 — 실패한 작업도 큐를 막지 않도록 성공/실패 모두 다음 작업으로 이어간다.
let googleSignInQueue: Promise<void> = Promise.resolve();

const withGoogleSignInLock = <T>(task: () => Promise<T>): Promise<T> => {
  const run = googleSignInQueue.then(task, task);
  googleSignInQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
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

// 로그인 계정과 캘린더에 실제 일정이 들어있는 계정이 다른 경우가 흔해서(회사용/개인용
// 분리 등), addScopes처럼 현재 로그인된 계정에 조용히 스코프만 추가하는 방식 대신 항상
// 계정 선택 화면이 뜨는 전체 동의(signIn) 플로우를 쓴다. 캘린더 전용 클라이언트로 잠깐
// 바꿔 code를 발급받고, 끝나면 로그인용 기본 설정으로 되돌려 다음 로그인이 캘린더
// 스코프를 물려받지 않게 한다.
const requestGoogleCalendarConnectCodeLocked = async (): Promise<string> => {
  try {
    GoogleSignin.configure({
      ...BASE_GOOGLE_SIGNIN_CONFIG,
      webClientId: GOOGLE_CALENDAR_WEB_CLIENT_ID,
      scopes: [GOOGLE_CALENDAR_SCOPE],
    });
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (response.type === 'cancelled') {
      throw new Error(SOCIAL_LOGIN_CANCELLED);
    }
    if (response.type !== 'success' || !response.data.serverAuthCode) {
      throw new Error('구글 캘린더 연동에 실패했습니다.');
    }
    return response.data.serverAuthCode;
  } finally {
    GoogleSignin.configure(BASE_GOOGLE_SIGNIN_CONFIG);
  }
};

export const requestGoogleCalendarConnectCode = (): Promise<string> =>
  withGoogleSignInLock(requestGoogleCalendarConnectCodeLocked);

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
      return withGoogleSignInLock(requestGoogleToken);
    case 'KAKAO':
      return requestKakaoToken();
    case 'APPLE':
      return requestAppleToken();
  }
};
