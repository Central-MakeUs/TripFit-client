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
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import { getWebUrl } from '../utils/webViewUrl';

type WebViewComponentProps = ComponentProps<typeof WebView>;
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
        onNavigationStateChange={handleNavigationStateChange}
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
