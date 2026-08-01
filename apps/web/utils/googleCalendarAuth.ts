import { openExternalUrl } from '@/utils/nativeBridge';
import { createOAuthReturnPath, createOAuthState } from '@/utils/oauthState';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.freebusy';

// oauthState.ts의 provider 키들과 겹치지 않는 별도 값 — 로그인이 아니라 이미 로그인된
// 사용자의 추가 권한 동의 플로우라 SocialProviderT와는 무관하다.
const OAUTH_PROVIDER_KEY = 'GOOGLE_CALENDAR';

export const getGoogleCalendarRedirectUri = () =>
  `${window.location.origin}/auth/google-calendar/callback`;

// 이미 로그인된 사용자의 캘린더 읽기 권한 추가 동의라 로그인과 달리 id_token/nonce가 필요
// 없다. 회원가입/마이페이지 등 여러 화면에서 시작할 수 있어 완료 후 돌아갈 경로(returnPath)를
// 리다이렉트 왕복 동안 세션에 기억해둔다.
//
// - access_type=offline 없으면 구글이 refresh_token을 내려주지 않아 백엔드 연동이 실패한다.
// - prompt=consent 없으면, 같은 계정으로 이미 이 클라이언트에 동의한 적 있는 사용자에게는
//   구글이 동의 화면 자체를 건너뛰어 버려 역시 refresh_token을 못 받는다(로그인 플로우는
//   재로그인 UX를 위해 의도적으로 이 옵션을 안 쓰지만, 캘린더는 필수).
// - 구글이 앱 내장 WebView를 "제한된 브라우저"로 감지해 동의 화면을 막을 수 있어, 이 URL은
//   WebView 안에서 직접 열지 않고 시스템 기본 브라우저로 열도록 위임한다.
export const startGoogleCalendarConnect = (returnPath: string) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID;
  if (!clientId) {
    throw new Error('구글 캘린더 연동 설정이 올바르지 않습니다.');
  }

  createOAuthReturnPath(OAUTH_PROVIDER_KEY, returnPath);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleCalendarRedirectUri(),
    response_type: 'code',
    scope: GOOGLE_CALENDAR_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state: createOAuthState(OAUTH_PROVIDER_KEY),
  });

  openExternalUrl(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

export const GOOGLE_CALENDAR_OAUTH_PROVIDER_KEY = OAUTH_PROVIDER_KEY;
