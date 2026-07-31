import { NextResponse } from 'next/server';

// iOS Universal Links 검증용 파일. 확장자가 없어야 하고 Content-Type도 반드시
// application/json이어야 iOS가 유효한 AASA로 인식한다.
// appID의 "6U7LKG9262"는 Apple Developer 계정의 실제 Team ID다.
export function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: '6U7LKG9262.com.tripfit.app',
            paths: ['/room/*'],
          },
        ],
      },
    },
    { headers: { 'Content-Type': 'application/json' } },
  );
}
