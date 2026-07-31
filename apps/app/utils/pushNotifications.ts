import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

import { NativePushTokenResult, PushDeviceType } from '../types/bridge';

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
    // iOS는 expo-notifications가 원격 알림 등록에 개입할 수 있어 Firebase의 자동 APNs
    // 등록(swizzling)이 씹힐 수 있다 — 명시적으로 등록해 안전망을 둔다(중복 호출해도 무해함).
    if (Platform.OS === 'ios') {
      await registerDeviceForRemoteMessages(messaging);
    }

    const token = await getToken(messaging);
    const deviceType: PushDeviceType =
      Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

    return { token, deviceType };
  };
