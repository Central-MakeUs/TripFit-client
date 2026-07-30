import { NextRequest, NextResponse } from 'next/server';

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';

// 카카오 인가 코드 → 액세스 토큰 교환은 Client Secret이 필요해 브라우저에서 직접 할 수 없다.
// 이 라우트가 서버에서만 실행되어 Client Secret을 노출하지 않고 교환을 대신 처리한다.
// 카카오 콘솔에 등록된 값이 아니라 우리 클라이언트 코드(kakaoAuth.ts)만 호출하는 내부 경로다.
const handleKakao = async (request: NextRequest) => {
  const { code, redirectUri } = await request.json();

  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  if (!restApiKey || !clientSecret || !code || !redirectUri) {
    return NextResponse.json(
      { message: '카카오 로그인 설정이 올바르지 않습니다.' },
      { status: 500 },
    );
  }

  const tokenResponse = await fetch(KAKAO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: restApiKey,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { message: '카카오 로그인 토큰 교환에 실패했습니다.' },
      { status: 401 },
    );
  }

  const data: { access_token: string } = await tokenResponse.json();
  return NextResponse.json({ accessToken: data.access_token });
};

// 애플은 scope에 name/email이 포함되면 id_token(+code)을 GET 쿼리가 아니라 POST body(form_post)로
// 돌려준다 — 클라이언트 페이지는 POST body를 읽을 수 없으므로, 이 라우트가 대신 받아서
// 쿼리로 붙여 /auth/apple/callback(카카오/구글과 동일한 공통 콜백 페이지)으로 리다이렉트한다.
// 애플 콘솔의 Return URL이 이 경로(/api/auth/apple/callback)를 그대로 가리킨다.
// code(인가 코드)는 우리가 따로 소비하지 않고 그대로 백엔드로 전달한다 — 탈퇴 시 애플 연동
// 해제(revoke)를 하려면 백엔드가 이 코드로 refresh token을 발급받아야 하기 때문이다.
const handleApple = async (request: NextRequest) => {
  const formData = await request.formData();
  const idToken = formData.get('id_token');
  const code = formData.get('code');
  const error = formData.get('error');

  const redirectUrl = new URL('/auth/apple/callback', request.url);
  if (typeof idToken === 'string' && idToken) {
    redirectUrl.searchParams.set('appleToken', idToken);
    if (typeof code === 'string' && code) {
      redirectUrl.searchParams.set('appleCode', code);
    }
  } else {
    redirectUrl.searchParams.set(
      'error',
      typeof error === 'string' ? error : '애플 로그인에 실패했습니다.',
    );
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (provider === 'kakao') return handleKakao(request);
  if (provider === 'apple') return handleApple(request);

  return NextResponse.json(
    { message: '지원하지 않는 provider입니다.' },
    { status: 404 },
  );
}
