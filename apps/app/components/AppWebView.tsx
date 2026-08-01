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
  Linking,
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
import {
  getPathFromDeepLink,
  getWebUrl,
  isWebOrigin,
} from '../utils/webViewUrl';

type WebViewComponentProps = ComponentProps<typeof WebView>;
type OnMessage = NonNullable<WebViewComponentProps['onMessage']>;
type OnNavigationStateChange = NonNullable<
  WebViewComponentProps['onNavigationStateChange']
>;
type OnShouldStartLoadWithRequest = NonNullable<
  WebViewComponentProps['onShouldStartLoadWithRequest']
>;

function AppWebView() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [uri, setUri] = useState(() => getWebUrl());

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

  // 앱이 완전히 종료된 상태에서 초대 링크(Universal Links/App Links)로 실행된 경우,
  // 최초 렌더 시점엔 그 URL을 알 수 없어 getInitialURL()로 별도 조회해야 한다.
  useEffect(() => {
    Linking.getInitialURL().then((initialUrl) => {
      if (!initialUrl) return;
      const path = getPathFromDeepLink(initialUrl);
      if (path) setUri(getWebUrl(path));
    });
  }, []);

  // 앱이 이미 떠 있는 상태(백그라운드 포함)에서 초대 링크를 탭한 경우엔 getInitialURL이
  // 아니라 이 이벤트로 들어온다.
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const path = getPathFromDeepLink(url);
      if (path) setUri(getWebUrl(path));
    });
    return () => subscription.remove();
  }, []);

  const sendToWeb = useCallback((message: BridgeIncomingMessage) => {
    webViewRef.current?.postMessage(JSON.stringify(message));
  }, []);

  // 알림 탭으로 앱이 콜드 스타트된 경우, WebView가 메시지 리스너를 등록하기 전에
  // postMessage를 보내면 유실된다 — 로딩이 끝날 때까지 대기시켰다가 보낸다.
  const pendingNotificationRef = useRef<Extract<
    BridgeIncomingMessage,
    { type: 'NOTIFICATION_OPENED' }
  > | null>(null);

  // handleNotificationOpened의 아이덴티티가 isLoading에 따라 바뀌면 아래 리스너 등록
  // useEffect가 매번 재실행되어 getInitialNotification()도 반복 호출된다 — 이 API는 같은
  // 세션에서 여러 번 호출해도 이전 알림을 다시 반환할 수 있어, WebView가 재로딩될 때마다
  // 이미 처리한 알림으로 강제 재이동하는 버그가 생긴다. isLoading은 ref로 참조해 콜백
  // 아이덴티티를 고정한다.
  const isLoadingRef = useRef(isLoading);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const handleNotificationOpened = useCallback(
    (landing: PushLandingData | null) => {
      if (!landing) return;
      const message: BridgeIncomingMessage = {
        type: 'NOTIFICATION_OPENED',
        ...landing,
      };
      if (isLoadingRef.current) {
        pendingNotificationRef.current = message;
      } else {
        sendToWeb(message);
      }
    },
    [sendToWeb],
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
        const { requestId } = message;
        requestNativePushToken()
          .then((result) => {
            sendToWeb({ type: 'PUSH_TOKEN_READY', requestId, ...result });
          })
          .catch((error) => {
            sendToWeb({
              type: 'PUSH_TOKEN_ERROR',
              requestId,
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

  // 카카오톡 공유(Kakao.Share.sendDefault)처럼 웹 페이지가 kakaotalk:// 같은
  // 커스텀 스킴으로 이동을 시도할 때, WebView는 그 스킴을 직접 렌더링할 수 없어
  // 아무 반응 없이 무시해버린다 — 대신 OS의 Linking으로 넘겨 실제 앱을 열게 한다.
  const handleShouldStartLoadWithRequest: OnShouldStartLoadWithRequest =
    useCallback((request) => {
      if (
        request.url.startsWith('http://') ||
        request.url.startsWith('https://') ||
        request.url.startsWith('about:')
      ) {
        return true;
      }

      Linking.openURL(request.url).catch(() => {});
      return false;
    }, []);

  const handleRetry = () => {
    setHasError(false);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 에러 시에도 webViewRef가 살아있어야 다시 시도(reload)가 가능하므로 WebView는 항상 마운트해두고 오버레이로만 가린다 */}
      <WebView
        ref={webViewRef}
        source={{ uri }}
        style={styles.webview}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
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
