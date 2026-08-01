'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { onNativeNotificationReceived } from '@/utils/nativeBridge';
import { isReactNativeWebView } from '@/utils/platform';

// 홈 화면을 보고 있는 동안 푸시가 도착하면, 다음 화면 진입 없이도
// 알림센터 뱃지가 바로 갱신되도록 알림 목록 쿼리를 즉시 무효화한다.
function NotificationReceivedHandler() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isReactNativeWebView()) return;

    return onNativeNotificationReceived(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
  }, [queryClient]);

  return null;
}

export default NotificationReceivedHandler;
