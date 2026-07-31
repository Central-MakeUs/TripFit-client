import { NextResponse } from 'next/server';

// Android App Links 검증용 파일.
// 현재는 디버그 키스토어(~/.android/debug.keystore)의 SHA256 지문만 등록돼 있다.
// TODO: 실제 배포(release) 키스토어의 SHA256 지문을 발급받는 대로 배열에 추가해야
// 한다 — 그 전까지는 릴리즈 빌드에서 App Links 자동 검증이 통과하지 않는다.
export function GET() {
  return NextResponse.json(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.tripfit.app',
          sha256_cert_fingerprints: [
            '0C:9E:F9:0A:E9:86:3A:15:DD:77:C0:C8:6F:D4:16:57:E4:E6:18:2C:A3:A4:30:C4:6B:60:BD:C9:F4:B2:62:2C',
          ],
        },
      },
    ],
    { headers: { 'Content-Type': 'application/json' } },
  );
}
