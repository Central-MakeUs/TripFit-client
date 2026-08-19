import { request } from '@/apis/request';

// 요청 바디 없음 — refreshToken은 서버가 쿠키로 자동 식별하고, accessToken 즉시
// 무효화(블랙리스트) 기능은 폐지됐다(만료가 15분으로 짧아져 그 노출 창을 대신
// 최소화). 로그아웃/탈퇴 이후에도 그 시점에 이미 발급된 accessToken은 자연
// 만료 전까지 유효할 수 있는 게 의도된 동작이다.
export const postLogout = () =>
  request<void>('/api/v1/auth/logout', { method: 'POST' });
