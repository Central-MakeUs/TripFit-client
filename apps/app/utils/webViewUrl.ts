import { Platform } from 'react-native';

const PRODUCTION_WEB_URL = 'https://tripfit.online';
const LOCAL_WEB_URL = 'http://localhost:3000';

// Android는 호스트 머신의 localhost를 10.0.2.2로 치환한다. 에뮬레이터에서는 이 주소로
// 호스트에 접근할 수 있지만, 실기기에서는 10.0.2.2가 아무 의미 없는 주소라 로컬 개발 서버에
// 접근할 수 없다 — 실기기로 로컬 개발 서버를 테스트하려면 호스트의 LAN IP를 직접 써야 한다.
export const getWebUrl = (): string => {
  const url = __DEV__ ? LOCAL_WEB_URL : PRODUCTION_WEB_URL;

  if (Platform.OS === 'android') {
    return url.replace('localhost', '10.0.2.2');
  }

  return url;
};

const getOrigin = (url: string): string =>
  url.match(/^[a-zA-Z][a-zA-Z\d+.-]*:\/\/[^/?#]+/)?.[0] ?? url;

// 네이티브 브릿지 메시지를 처리하기 전에, 그 메시지를 보낸 WebView가 지금 우리가 로드한
// 웹앱 origin에 있는지 확인한다 — WebView가 (리다이렉트 등으로) 다른 origin으로 이동한
// 상태에서 postMessage를 보내는 경우까지 신뢰하지 않기 위함이다.
export const isWebOrigin = (url: string): boolean =>
  getOrigin(url) === getOrigin(getWebUrl());
