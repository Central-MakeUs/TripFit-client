import { useState } from 'react';

import { startGoogleCalendarConnect } from '@/utils/googleCalendarAuth';
import { isIOS, isKakaoTalkInAppBrowser } from '@/utils/platform';

// 카카오톡 인앱 브라우저(환경 B)에서는 안드로이드만 intent 스킴으로 시스템 브라우저 탈출이
// 가능하고, iOS는 카카오톡이 그런 탈출 수단을 제공하지 않아 사용자가 브라우저 메뉴에서
// 직접 "다른 브라우저로 열기"를 눌러야 한다 — 그 안내 모달을 띄울지 여부를 여기서 판단한다.
export const useGoogleCalendarConnect = () => {
  const [isKakaoBrowserAlertOpen, setIsKakaoBrowserAlertOpen] = useState(false);

  const connectGoogleCalendar = (returnPath: string) => {
    if (isKakaoTalkInAppBrowser() && isIOS()) {
      setIsKakaoBrowserAlertOpen(true);
      return;
    }
    startGoogleCalendarConnect(returnPath);
  };

  return {
    connectGoogleCalendar,
    isKakaoBrowserAlertOpen,
    closeKakaoBrowserAlert: () => setIsKakaoBrowserAlertOpen(false),
  };
};
