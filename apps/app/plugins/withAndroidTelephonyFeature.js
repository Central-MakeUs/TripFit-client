// Expo config plugin은 CommonJS(require/module.exports)로 작성해야 로더가 읽을 수 있다.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withAndroidManifest } = require('expo/config-plugins');

// 전화 기능을 필수로 선언해두지 않으면 Play가 태블릿/TV/Android
// Auto/Chromebook처럼 이 앱과 무관한 폼팩터까지 전부 "설치 가능"으로
// 계산해버린다 — 전화 기능 필수 선언 하나로 그런 기기들을 한 번에
// 지원 대상에서 제외한다.
const withAndroidTelephonyFeature = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest['uses-feature']) {
      manifest['uses-feature'] = [];
    }

    const alreadyExists = manifest['uses-feature'].some(
      (feature) => feature.$?.['android:name'] === 'android.hardware.telephony',
    );

    if (!alreadyExists) {
      manifest['uses-feature'].push({
        $: {
          'android:name': 'android.hardware.telephony',
          'android:required': 'true',
        },
      });
    }

    return config;
  });
};

module.exports = withAndroidTelephonyFeature;
