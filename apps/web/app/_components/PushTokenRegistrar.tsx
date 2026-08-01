'use client';

import { useEffect, useRef } from 'react';

import { usePatchMyPageProfile } from '@/hooks/usePatchMyPageProfile';
import { usePostDeviceToken } from '@/hooks/usePostDeviceToken';
import { useAuthStore } from '@/stores/authStore';
import { requestNativePushToken } from '@/utils/nativeBridge';
import { isReactNativeWebView } from '@/utils/platform';

// 앱(WebView)에서 로그인 상태가 되는 시점에 한 번, 네이티브에 FCM 토큰을 요청해 서버에 등록한다.
// 일반 브라우저(참여자가 카카오 링크로 들어오는 경우)에는 네이티브 브릿지가 없어 아무 동작도 하지 않는다.
function PushTokenRegistrar() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setPushDeviceToken = useAuthStore((state) => state.setPushDeviceToken);
  const { postDeviceTokenMutation } = usePostDeviceToken();
  const { patchMyPageProfileMutation } = usePatchMyPageProfile();
  // boolean이 아니라 처리한 accessToken 값 자체를 기억한다 — 로그아웃 후 /signup(공개 경로)에서도
  // 이 컴포넌트는 계속 마운트돼 있어서(AuthGuard 참고), boolean이면 최초 로그인 이후 계속 true로
  // 남아 재로그인 시 새 세션의 토큰 등록이 스킵된다. 세션(토큰) 단위로 묶으면 로그아웃 시
  // accessToken이 바뀌는 것만으로 자연히 재등록된다.
  const requestedForTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // notificationEnabled를 구독하지 않고 실행 시점에 한 번만 읽는다 — 구독하면 아래
    // patchMyPageProfileMutation 성공으로 그 값이 바뀔 때마다 이 effect가 다시 돌아
    // 불필요하게(또는 무한히) 재등록을 시도하게 된다.
    if (
      !accessToken ||
      !isReactNativeWebView() ||
      !useAuthStore.getState().notificationEnabled ||
      requestedForTokenRef.current === accessToken
    ) {
      return;
    }
    requestedForTokenRef.current = accessToken;

    requestNativePushToken()
      .then(({ token, deviceType }) => {
        postDeviceTokenMutation(
          { token, deviceType },
          {
            onSuccess: () => {
              setPushDeviceToken(token);
              // 마이페이지 토글과 별개로, 최초 로그인 시 OS 권한을 허용한 경우에도
              // 백엔드의 알림 설정값을 실제 등록 성공 여부와 맞춰둔다.
              patchMyPageProfileMutation({ notificationEnabled: true });
            },
          },
        );
      })
      .catch(() => {
        // 알림 권한 거부 등으로 실패해도 앱 사용 자체를 막을 필요는 없어 조용히 무시한다.
      });
  }, [
    accessToken,
    postDeviceTokenMutation,
    setPushDeviceToken,
    patchMyPageProfileMutation,
  ]);

  return null;
}

export default PushTokenRegistrar;
