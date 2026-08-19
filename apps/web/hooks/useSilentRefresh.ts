import { useEffect, useState } from 'react';

import { ApiError, refreshAccessToken } from '@/apis/request';
import { useAuthStore } from '@/stores/authStore';

export type SilentRefreshStatusT =
  | 'pending'
  | 'authenticated'
  | 'unauthenticated'
  | 'network-error';

// accessToken은 XSS 노출 표면을 줄이기 위해 localStorage에 남기지 않고 메모리로만
// 들고 있는다 — 그래서 새로고침·재방문 시엔 매번 null로 시작한다. userId가 하이드레이션돼
// 있으면(이 기기에서 로그인한 적 있음) 쿠키에 자동으로 실리는 refreshToken으로 미리 한 번
// 재발급을 시도해, 화면을 그리기 전에 실제 로그인 여부를 확정한다. userId가 없는(로그인한
// 적 없는) 방문자는 쿠키가 있을 리 없으므로 이 호출 자체를 건너뛴다.
//
// 401/403(쿠키 없음·만료·재사용 감지)과 그 외 실패(네트워크 오류·타임아웃 등)를
// 구분한다 — 후자는 세션 자체는 멀쩡한데 이 확인 요청만 실패한 것이라, 로그인 화면으로
// 보내버리면 "로그인했는데 로그아웃된 것처럼" 보인다. network-error 상태를 별도로
// 노출해 호출부(AuthGuard)가 재시도 UI를 보여줄 수 있게 한다.
export const useSilentRefresh = (hasHydrated: boolean) => {
  const userId = useAuthStore((state) => state.userId);
  const clear = useAuthStore((state) => state.clear);
  const [status, setStatus] = useState<SilentRefreshStatusT>('pending');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!userId) {
      setStatus('unauthenticated');
      return;
    }
    setStatus('pending');
    refreshAccessToken()
      .then(() => setStatus('authenticated'))
      .catch((error) => {
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          clear();
          setStatus('unauthenticated');
          return;
        }
        setStatus('network-error');
      });
    // userId는 이 effect가 실행되는 시점(hasHydrated가 true로 바뀌거나 재시도할
    // 때)의 값만 필요하다 — refreshAccessToken 성공/clear() 이후 userId가 바뀌어도
    // 이 effect를 다시 돌릴 이유가 없으므로 의존성에서 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, retryCount]);

  const retry = () => setRetryCount((count) => count + 1);

  return { status, retry };
};
