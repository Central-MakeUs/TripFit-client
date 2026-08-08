import { NextResponse } from 'next/server';

// Android App Links 검증용 파일.
// 첫 번째는 디버그 키스토어(~/.android/debug.keystore), 두 번째는 Play 서명 키의
// SHA256 지문 — Play 콘솔 설정 > 앱 무결성 > 앱 서명 키 인증서에서 확인.
export function GET() {
  return NextResponse.json(
    [
      {
        relation: [
          'delegate_permission/common.handle_all_urls',
          'delegate_permission/common.get_login_creds',
        ],
        target: {
          namespace: 'android_app',
          package_name: 'com.tripfit.app',
          sha256_cert_fingerprints: [
            '0C:9E:F9:0A:E9:86:3A:15:DD:77:C0:C8:6F:D4:16:57:E4:E6:18:2C:A3:A4:30:C4:6B:60:BD:C9:F4:B2:62:2C',
            'DD:AC:FF:67:3D:BE:CC:F7:F1:B0:C4:C9:E2:A7:E7:3C:46:CD:A4:C7:2C:8A:41:14:F0:F2:C1:47:FB:08:25:94',
          ],
        },
      },
    ],
    { headers: { 'Content-Type': 'application/json' } },
  );
}
