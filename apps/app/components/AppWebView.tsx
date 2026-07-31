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
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import {
  BridgeIncomingMessage,
  parseBridgeMessage,
  PushLandingData,
} from '../types/bridge';
import {
  getPushLandingData,
  requestNativePushToken,
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
    const messaging = getMessaging(getApp());

    getInitialNotification(messaging).then((remoteMessage) => {
      if (remoteMessage) {
        handleNotificationOpened(getPushLandingData(remoteMessage));
      }
    });

    return onNotificationOpenedApp(messaging, (remoteMessage) => {
      handleNotificationOpened(getPushLandingData(remoteMessage));
    });
  }, [handleNotificationOpened]);

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

  const handleNavigationStateChange: OnNavigationStateChange = useCallback(
    (navState) => {
      setCanGoBack(navState.canGoBack);
    },
    [],
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
        onLoadEnd={() => {
          setIsLoading(false);
          if (pendingNotificationRef.current) {
            sendToWeb(pendingNotificationRef.current);
            pendingNotificationRef.current = null;
          }
        }}
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
