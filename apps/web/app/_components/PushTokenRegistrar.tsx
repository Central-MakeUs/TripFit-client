'use client';

import { useEffect, useRef } from 'react';

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
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!accessToken || !isReactNativeWebView() || hasRequestedRef.current) {
      return;
    }
    hasRequestedRef.current = true;

    requestNativePushToken()
      .then(({ token, deviceType }) => {
        postDeviceTokenMutation(
          { token, deviceType },
          { onSuccess: () => setPushDeviceToken(token) },
        );
      })
      .catch(() => {
        // 알림 권한 거부 등으로 실패해도 앱 사용 자체를 막을 필요는 없어 조용히 무시한다.
      });
  }, [accessToken, postDeviceTokenMutation, setPushDeviceToken]);

  return null;
}

export default PushTokenRegistrar;
