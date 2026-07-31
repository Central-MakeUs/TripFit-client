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
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import { BridgeIncomingMessage, parseBridgeMessage } from '../types/bridge';
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

  const handleMessage: OnMessage = useCallback(
    (event) => {
      if (!isWebOrigin(event.nativeEvent.url)) return;

      const message = parseBridgeMessage(event.nativeEvent.data);
      if (!message) return;

      requestNativeSocialLoginToken(message.provider)
        .then((result) => {
          sendToWeb({
            type: 'SOCIAL_LOGIN_SUCCESS',
            provider: message.provider,
            ...result,
          });
        })
        .catch((error) => {
          sendToWeb({
            type: 'SOCIAL_LOGIN_ERROR',
            provider: message.provider,
            message:
              error instanceof Error
                ? error.message
                : '로그인 중 문제가 발생했어요.',
          });
        });
    },
    [sendToWeb],
  );

  const handleNavigationStateChange: OnNavigationStateChange = useCallback(
    (navState) => {
      setCanGoBack(navState.canGoBack);
    },
    [],
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
        onLoadEnd={() => setIsLoading(false)}
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
