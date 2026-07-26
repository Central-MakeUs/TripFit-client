import { Platform } from 'react-native';

// TODO: 배포 도메인 정해지면 실제 주소로 교체
const PRODUCTION_WEB_URL = 'https://tripfit.online';
const LOCAL_WEB_URL = 'http://localhost:3000';

// Android 에뮬레이터는 호스트 머신의 localhost를 10.0.2.2로만 접근할 수 있다.
// (iOS 시뮬레이터/실기기, 실제 배포 도메인은 그대로 사용)
export const getWebUrl = (): string => {
  const url = __DEV__ ? LOCAL_WEB_URL : PRODUCTION_WEB_URL;

  if (Platform.OS === 'android') {
    return url.replace('localhost', '10.0.2.2');
  }

  return url;
};
