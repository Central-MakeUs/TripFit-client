import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppWebView from './components/AppWebView';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppWebView />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
