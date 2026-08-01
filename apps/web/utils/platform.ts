export const isReactNativeWebView = () =>
  typeof window !== 'undefined' && 'ReactNativeWebView' in window;

export const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
  );
};

export const isAndroid = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

// 카카오톡 자체 인앱 브라우저(공유 링크를 앱 미설치 상태로 열었을 때)는 User-Agent에
// "KAKAOTALK"이 포함된다 — 구글이 이 브라우저를 "제한된 브라우저"로 감지해 OAuth
// 동의 화면을 막으므로, 이 안에서는 시스템 기본 브라우저로 탈출시켜야 한다.
export const isKakaoTalkInAppBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  return /KAKAOTALK/i.test(navigator.userAgent);
};
