'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getLandingPath } from '@/utils/getLandingPath';
import { onNativeNotificationOpened } from '@/utils/nativeBridge';
import { isReactNativeWebView } from '@/utils/platform';

// 앱(WebView)이 푸시 탭으로 콜드 스타트되거나 백그라운드에서 복귀할 때,
// 네이티브가 보내주는 랜딩 정보를 받아 해당 화면으로 이동시킨다.
function NotificationDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!isReactNativeWebView()) return;

    return onNativeNotificationOpened(({ landingType, tripId }) => {
      router.push(getLandingPath(landingType, tripId));
    });
  }, [router]);

  return null;
}

export default NotificationDeepLinkHandler;
