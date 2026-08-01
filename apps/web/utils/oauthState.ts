// 소셜 로그인 리다이렉트(웹 브라우저 플로우 전용, 네이티브 브릿지 플로우는 해당 없음)의
// 요청↔콜백을 연결하는 CSRF 방지용 state와, ID 토큰 재생 공격을 막는 nonce를 관리한다.
// 같은 탭에서의 왕복 한 번에만 유효하면 되므로 sessionStorage를 쓴다.
const STATE_STORAGE_PREFIX = 'tripfit-oauth-state:';
const NONCE_STORAGE_PREFIX = 'tripfit-oauth-nonce:';
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
  const state = crypto.randomUUID();
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
  const nonce = crypto.randomUUID();
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
