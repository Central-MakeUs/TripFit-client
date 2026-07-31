import {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import {
  BridgeIncomingMessage,
  parseBridgeMessage,
  PushLandingData,
} from '../types/bridge';
import {
  configureForegroundNotificationHandler,
  getPushLandingData,
  getPushLandingDataFromLocalNotification,
  requestNativePushToken,
  showForegroundNotification,
} from '../utils/pushNotifications';
import { requestNativeSocialLoginToken } from '../utils/socialLogin';
import { getWebUrl, isWebOrigin } from '../utils/webViewUrl';

type WebViewComponentProps = ComponentProps<typeof WebView>;
type OnMessage = NonNullable<WebViewComponentProps['onMessage']>;
type OnNavigationStateChange = NonNullable<
  WebViewComponentProps['onNavigationStateChange']
>;

function AppWebView() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack) {
          webViewRef.current?.goBack();
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [canGoBack]);

  const sendToWeb = useCallback((message: BridgeIncomingMessage) => {
    webViewRef.current?.postMessage(JSON.stringify(message));
  }, []);

  // 알림 탭으로 앱이 콜드 스타트된 경우, WebView가 메시지 리스너를 등록하기 전에
  // postMessage를 보내면 유실된다 — 로딩이 끝날 때까지 대기시켰다가 보낸다.
  const pendingNotificationRef = useRef<Extract<
    BridgeIncomingMessage,
    { type: 'NOTIFICATION_OPENED' }
  > | null>(null);

  const handleNotificationOpened = useCallback(
    (landing: PushLandingData | null) => {
      if (!landing) return;
      const message: BridgeIncomingMessage = {
        type: 'NOTIFICATION_OPENED',
        ...landing,
      };
      if (isLoading) {
        pendingNotificationRef.current = message;
      } else {
        sendToWeb(message);
      }
    },
    [isLoading, sendToWeb],
  );

  useEffect(() => {
    configureForegroundNotificationHandler();

    const messaging = getMessaging(getApp());

    getInitialNotification(messaging).then((remoteMessage) => {
      if (remoteMessage) {
        handleNotificationOpened(getPushLandingData(remoteMessage));
      }
    });

    // 앱이 열려 있는 동안 도착한 메시지는 OS가 배너를 자동으로 띄워주지 않아 직접 띄운다.
    // 홈 화면을 보고 있는 동안 도착한 경우 알림센터 뱃지가 갱신되도록 웹에도 알려준다.
    const unsubscribeOnMessage = onMessage(messaging, (remoteMessage) => {
      showForegroundNotification(remoteMessage);
      sendToWeb({ type: 'NOTIFICATION_RECEIVED' });
    });
    const unsubscribeOnOpenedApp = onNotificationOpenedApp(
      messaging,
      (remoteMessage) => {
        handleNotificationOpened(getPushLandingData(remoteMessage));
      },
    );
    // 위에서 직접 띄운 로컬 알림을 탭한 경우는 FCM 경로가 아니라 이 리스너로 들어온다.
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        handleNotificationOpened(getPushLandingDataFromLocalNotification(data));
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpenedApp();
      responseSubscription.remove();
    };
  }, [handleNotificationOpened, sendToWeb]);

  const handleMessage: OnMessage = useCallback(
    (event) => {
      if (!isWebOrigin(event.nativeEvent.url)) return;

      const message = parseBridgeMessage(event.nativeEvent.data);
      if (!message) return;

      if (message.type === 'SOCIAL_LOGIN_REQUEST') {
        const { provider } = message;
        requestNativeSocialLoginToken(provider)
          .then((result) => {
            sendToWeb({ type: 'SOCIAL_LOGIN_SUCCESS', provider, ...result });
          })
          .catch((error) => {
            sendToWeb({
              type: 'SOCIAL_LOGIN_ERROR',
              provider,
              message:
                error instanceof Error
                  ? error.message
                  : '로그인 중 문제가 발생했어요.',
            });
          });
        return;
      }

      if (message.type === 'PUSH_TOKEN_REQUEST') {
        requestNativePushToken()
          .then((result) => {
            sendToWeb({ type: 'PUSH_TOKEN_READY', ...result });
          })
          .catch((error) => {
            sendToWeb({
              type: 'PUSH_TOKEN_ERROR',
              message:
                error instanceof Error
                  ? error.message
                  : '알림 토큰을 받아오지 못했어요.',
            });
          });
      }
    },
    [sendToWeb],
  );

  // 로딩 종료 시점은 onLoadEnd 대신 이 값을 기준으로 삼는다 — Android에서는 클라이언트
  // 사이드 라우팅(예: 로그인 안 된 상태의 /signup 리다이렉트) 시 onLoadEnd가 불리지 않는
  // 경우가 있어, 오버레이가 안 걷히고 흰 화면에 멈추는 문제가 있었다.
  const handleLoadFinished = useCallback(() => {
    setIsLoading(false);
    if (pendingNotificationRef.current) {
      sendToWeb(pendingNotificationRef.current);
      pendingNotificationRef.current = null;
    }
  }, [sendToWeb]);

  const handleNavigationStateChange: OnNavigationStateChange = useCallback(
    (navState) => {
      setCanGoBack(navState.canGoBack);
      if (!navState.loading) handleLoadFinished();
    },
    [handleLoadFinished],
  );

  const handleRetry = () => {
    setHasError(false);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 에러 시에도 webViewRef가 살아있어야 다시 시도(reload)가 가능하므로 WebView는 항상 마운트해두고 오버레이로만 가린다 */}
      <WebView
        ref={webViewRef}
        source={{ uri: getWebUrl() }}
        style={styles.webview}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={handleLoadFinished}
        onError={() => setHasError(true)}
      />
      {hasError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>페이지를 불러오지 못했어요.</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default AppWebView;
