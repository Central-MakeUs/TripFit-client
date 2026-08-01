import { Platform } from 'react-native';

const PRODUCTION_WEB_URL = 'https://tripfit.online';
const LOCAL_WEB_URL = 'http://localhost:3000';

// Android는 호스트 머신의 localhost를 10.0.2.2로 치환한다. 에뮬레이터에서는 이 주소로
// 호스트에 접근할 수 있지만, 실기기에서는 10.0.2.2가 아무 의미 없는 주소라 로컬 개발 서버에
// 접근할 수 없다 — 실기기로 로컬 개발 서버를 테스트하려면 호스트의 LAN IP를 직접 써야 한다.
const getBaseWebUrl = (): string => {
  const url = __DEV__ ? LOCAL_WEB_URL : PRODUCTION_WEB_URL;
  return Platform.OS === 'android' ? url.replace('localhost', '10.0.2.2') : url;
};

// path를 넘기면(예: "/room/123?foo=bar") 딥링크(Universal Links/App Links)로 들어온
// 특정 화면으로 바로 이동한다 — 안 넘기면 기존처럼 기본 홈 주소만 반환한다.
export const getWebUrl = (path?: string): string => {
  const base = getBaseWebUrl();
  return path ? `${base}${path}` : base;
};

const getOrigin = (url: string): string =>
  url.match(/^[a-zA-Z][a-zA-Z\d+.-]*:\/\/[^/?#]+/)?.[0] ?? url;

// https://tripfit.online/room/123 같은 딥링크 URL에서 path+query만 뽑아낸다.
// http(s)가 아닌 스킴(카카오톡 콜백 등)이 잘못 흘러들어온 경우 null을 반환해 무시한다.
export const getPathFromDeepLink = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
};

// 네이티브 브릿지 메시지를 처리하기 전에, 그 메시지를 보낸 WebView가 지금 우리가 로드한
// 웹앱 origin에 있는지 확인한다 — WebView가 (리다이렉트 등으로) 다른 origin으로 이동한
// 상태에서 postMessage를 보내는 경우까지 신뢰하지 않기 위함이다.
export const isWebOrigin = (url: string): boolean =>
  getOrigin(url) === getOrigin(getWebUrl());
