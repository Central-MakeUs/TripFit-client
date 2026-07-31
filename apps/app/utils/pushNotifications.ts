import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  RemoteMessage,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

import {
  NativePushTokenResult,
  PushDeviceType,
  PushLandingData,
} from '../types/bridge';

const ensureNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('알림 권한이 거부되었습니다.');
  }
};

export const requestNativePushToken =
  async (): Promise<NativePushTokenResult> => {
    await ensureNotificationPermission();

    const messaging = getMessaging(getApp());
    const token = await getToken(messaging);
    const deviceType: PushDeviceType =
      Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

    return { token, deviceType };
  };

// 백엔드 FCM data payload 확인 완료: { id, landingType, tripId } — 여행방과 무관한
// 알림(정기 리마인드)은 tripId 키 자체가 없어 undefined로 들어온다.
const extractPushLandingData = (
  data: Record<string, unknown> | undefined,
): PushLandingData | null => {
  const { id, landingType, tripId } = data ?? {};
  if (typeof landingType !== 'string') return null;

  return {
    id: typeof id === 'string' ? id : null,
    landingType,
    tripId: typeof tripId === 'string' ? tripId : null,
  };
};

export const getPushLandingData = (
  message: RemoteMessage,
): PushLandingData | null => extractPushLandingData(message.data);

// 포그라운드에서 직접 띄운 로컬 알림(showForegroundNotification)을 탭했을 때 쓰는 경로 —
// expo-notifications의 응답 객체는 RemoteMessage가 아니라 이 data만 들고 있다.
export const getPushLandingDataFromLocalNotification = (
  data: Record<string, unknown> | undefined,
): PushLandingData | null => extractPushLandingData(data);

// 앱이 포그라운드일 때는 FCM/APNs가 배너를 자동으로 띄워주지 않아, 직접 로컬 알림으로
// 만들어 보여준다. 이 핸들러는 그렇게 만든 로컬 알림을 포그라운드에서도 배너로 보이게 한다.
export const configureForegroundNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const showForegroundNotification = async (message: RemoteMessage) => {
  const title = message.notification?.title;
  const body = message.notification?.body;
  if (!title && !body) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: message.data ?? {} },
    trigger: null,
  });
};
