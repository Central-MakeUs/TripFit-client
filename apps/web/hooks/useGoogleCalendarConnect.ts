import { useState } from 'react';

import { usePostGoogleCalendar } from '@/hooks/usePostGoogleCalendar';
import { useAuthStore } from '@/stores/authStore';
import { startGoogleCalendarConnect } from '@/utils/googleCalendarAuth';
import {
  requestNativeGoogleCalendarConnect,
  SOCIAL_LOGIN_CANCELLED,
} from '@/utils/nativeBridge';
import {
  isIOS,
  isKakaoTalkInAppBrowser,
  isReactNativeWebView,
} from '@/utils/platform';

// 카카오톡 인앱 브라우저(환경 B)에서는 안드로이드만 intent 스킴으로 시스템 브라우저 탈출이
// 가능하고, iOS는 카카오톡이 그런 탈출 수단을 제공하지 않아 사용자가 브라우저 메뉴에서
// 직접 "다른 브라우저로 열기"를 눌러야 한다 — 그 안내 모달을 띄울지 여부를 여기서 판단한다.
export const useGoogleCalendarConnect = () => {
  const [isKakaoBrowserAlertOpen, setIsKakaoBrowserAlertOpen] = useState(false);
  const setGoogleCalendarConnected = useAuthStore(
    (state) => state.setGoogleCalendarConnected,
  );
  const { postGoogleCalendarMutationAsync } = usePostGoogleCalendar();

  // 웹 브라우저 리다이렉트 방식은 페이지 전체가 떠나버려 이 함수가 다시 관여할 일이
  // 없지만(반환된 Promise는 그냥 resolve되지 않은 채 버려진다), 앱(WebView)에서는
  // 네이티브 SDK로 code를 즉시 받아 그 자리에서 백엔드 연동까지 끝내므로 성공 여부를
  // boolean으로 바로 알려줄 수 있다 — redirect_uri 없이 authorizationCode만 보내는
  // 것도 이 경로라서 가능한 것(브라우저 리다이렉트 방식만 redirectUri가 필요).
  const connectGoogleCalendar = (
    returnPath: string,
    resumeScreen?: string,
  ): Promise<boolean> => {
    if (isKakaoTalkInAppBrowser() && isIOS()) {
      setIsKakaoBrowserAlertOpen(true);
      return Promise.resolve(false);
    }

    if (isReactNativeWebView()) {
      return requestNativeGoogleCalendarConnect()
        .then(({ authorizationCode }) =>
          postGoogleCalendarMutationAsync({ authorizationCode }),
        )
        .then(() => {
          setGoogleCalendarConnected(true);
          return true;
        })
        .catch((error) => {
          if (
            error instanceof Error &&
            error.message === SOCIAL_LOGIN_CANCELLED
          ) {
            return false;
          }
          throw error;
        });
    }

    startGoogleCalendarConnect(returnPath, resumeScreen);
    return new Promise<boolean>(() => {});
  };

  return {
    connectGoogleCalendar,
    isKakaoBrowserAlertOpen,
    closeKakaoBrowserAlert: () => setIsKakaoBrowserAlertOpen(false),
  };
};
