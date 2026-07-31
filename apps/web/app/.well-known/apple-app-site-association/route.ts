import { NextResponse } from 'next/server';

// iOS Universal Links 검증용 파일. 확장자가 없어야 하고 Content-Type도 반드시
// application/json이어야 iOS가 유효한 AASA로 인식한다.
// TODO: appID의 팀 ID(현재 "TEAMID" 플레이스홀더)를 실제 Apple Developer 계정의
// Team ID로 교체해야 한다 — 이 값 없이는 iOS에서 유니버설 링크가 동작하지 않는다.
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
