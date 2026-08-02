import { randomUUID } from '@/utils/uuid';

// 소셜 로그인 리다이렉트(웹 브라우저 플로우 전용, 네이티브 브릿지 플로우는 해당 없음)의
// 요청↔콜백을 연결하는 CSRF 방지용 state와, ID 토큰 재생 공격을 막는 nonce를 관리한다.
// 같은 탭에서의 왕복 한 번에만 유효하면 되므로 sessionStorage를 쓴다.
const STATE_STORAGE_PREFIX = 'tripfit-oauth-state:';
const NONCE_STORAGE_PREFIX = 'tripfit-oauth-nonce:';
const RETURN_PATH_STORAGE_PREFIX = 'tripfit-oauth-return-path:';
const REDIRECT_TARGET_STORAGE_KEY = 'tripfit-oauth-redirect-target';

// 구글/카카오/애플 로그인은 전체 페이지 이동(리다이렉트) 방식이라, /signup?redirect=...로
// 들어온 뒤 로그인 버튼을 누르면 그 쿼리 파라미터가 사라진 채(/auth/{provider}/callback)로
// 돌아온다 — 그 사이에도 원래 목적지를 잃지 않도록 페이지를 떠나기 직전에 저장해두고,
// 콜백 처리가 끝난 뒤 꺼내 쓴다.
export const saveOAuthRedirectTarget = (target: string) => {
  sessionStorage.setItem(REDIRECT_TARGET_STORAGE_KEY, target);
};

export const consumeOAuthRedirectTarget = (): string => {
  const target = sessionStorage.getItem(REDIRECT_TARGET_STORAGE_KEY);
  sessionStorage.removeItem(REDIRECT_TARGET_STORAGE_KEY);
  return target ?? '/';
};

export const createOAuthState = (provider: string): string => {
  const state = randomUUID();
  sessionStorage.setItem(`${STATE_STORAGE_PREFIX}${provider}`, state);
  return state;
};

// 콜백에서 돌아온 state가 우리가 발급한 값과 일치하는지 확인하고, 재사용을 막기 위해 즉시 지운다.
export const consumeOAuthState = (
  provider: string,
  returnedState: string | null,
): boolean => {
  const key = `${STATE_STORAGE_PREFIX}${provider}`;
  const savedState = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  return !!savedState && savedState === returnedState;
};

export const createOAuthNonce = (provider: string): string => {
  const nonce = randomUUID();
  sessionStorage.setItem(`${NONCE_STORAGE_PREFIX}${provider}`, nonce);
  return nonce;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// ID 토큰 payload의 nonce claim이 우리가 발급한 값과 일치하는지 확인한다. 서명 자체는
// 검증하지 않는다 — 별도 JWT 라이브러리 없이는 클라이언트에서 검증할 수 없고, 이 idToken은
// 최종적으로 백엔드 POST /api/v1/auth/login에 그대로 전달되어 백엔드가 서명을 검증한다.
export const consumeOAuthNonce = (
  provider: string,
  idToken: string,
): boolean => {
  const key = `${NONCE_STORAGE_PREFIX}${provider}`;
  const savedNonce = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  if (!savedNonce) return false;

  const payload = decodeJwtPayload(idToken);
  return payload?.nonce === savedNonce;
};

// 구글 캘린더 연동처럼 같은 플로우를 여러 화면(회원가입, 마이페이지 등)에서 시작할 수 있는
// 경우, 리다이렉트 왕복 동안 "완료 후 어디로 돌아갈지"를 기억해뒀다가 콜백에서 꺼내 쓴다.
export const createOAuthReturnPath = (provider: string, path: string): void => {
  sessionStorage.setItem(`${RETURN_PATH_STORAGE_PREFIX}${provider}`, path);
};

export const consumeOAuthReturnPath = (provider: string): string | null => {
  const key = `${RETURN_PATH_STORAGE_PREFIX}${provider}`;
  const path = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  return path;
};

const CALENDAR_RESUME_SCREEN_STORAGE_KEY =
  'tripfit-calendar-connect-resume-screen';
const PENDING_CALENDAR_RESUME_SCREEN_STORAGE_KEY =
  'tripfit-calendar-connect-pending-resume-screen';

// "돌아왔을 때 어느 화면을 보여줄지"를 URL 쿼리(resumeScreen)로 실어 보내면, 이후
// 완전히 무관한 재방문에서도 그 쿼리로 진입했던 상태가 다시 나타나는 문제가 있었다
// (예: 캘린더 연동 완료 후 홈에 나갔다가 헤더 아이콘으로 다시 들어가면 매번 완료 화면이
// 뜸) — URL과 무관한 세션 저장소 1회성 값으로 분리해 이 문제를 원천적으로 없앤다.
//
// 이 값은 반드시 "연동이 실제로 성공한 시점"(콜백 페이지)에만 set해야 한다 — 리다이렉트
// 시작 시점에 미리 set해두면, 사용자가 구글 동의 화면에서 취소/뒤로가기해 콜백에
// 도달하지 못한 채 원래 화면으로 돌아와도 이 값이 그대로 남아있어, 연동에 실패했는데도
// 완료 화면이 뜨는 버그가 생긴다. 리다이렉트 시작 시점엔 아래 pending 버전에만 저장해두고,
// 콜백이 실제 성공을 확인한 뒤에야 이 값으로 승격시킨다.
export const setCalendarConnectResumeScreen = (screen: string): void => {
  sessionStorage.setItem(CALENDAR_RESUME_SCREEN_STORAGE_KEY, screen);
};

export const consumeCalendarConnectResumeScreen = (): string | null => {
  const screen = sessionStorage.getItem(CALENDAR_RESUME_SCREEN_STORAGE_KEY);
  sessionStorage.removeItem(CALENDAR_RESUME_SCREEN_STORAGE_KEY);
  return screen;
};

// 리다이렉트를 시작하는 시점엔 아직 연동 성공 여부를 모르므로, "성공하면 이 화면으로
// 재개해달라"는 요청만 임시로 저장해둔다 — 실제로 화면에 영향을 주는 값이 아니라 콜백이
// 성공을 확인했을 때만 참고하는 데이터라, 취소/실패로 콜백에 도달하지 못해도 무해하다
// (다음 시도 시 덮어써지거나 그냥 버려짐).
export const savePendingCalendarConnectResumeScreen = (
  screen: string,
): void => {
  sessionStorage.setItem(PENDING_CALENDAR_RESUME_SCREEN_STORAGE_KEY, screen);
};

export const consumePendingCalendarConnectResumeScreen = (): string | null => {
  const screen = sessionStorage.getItem(
    PENDING_CALENDAR_RESUME_SCREEN_STORAGE_KEY,
  );
  sessionStorage.removeItem(PENDING_CALENDAR_RESUME_SCREEN_STORAGE_KEY);
  return screen;
};
