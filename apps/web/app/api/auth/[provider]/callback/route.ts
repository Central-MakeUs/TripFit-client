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

// id_token/인가 코드를 담아두는 단발성 쿠키 이름. HttpOnly라 클라이언트 JS는 절대 읽을 수 없고,
// 아래 GET 핸들러가 한 번 읽고 나면 즉시 만료시킨다.
const APPLE_EXCHANGE_COOKIE = 'apple-auth-exchange';

// 애플은 scope에 name/email이 포함되면 id_token(+code)을 GET 쿼리가 아니라 POST body(form_post)로
// 돌려준다 — 클라이언트 페이지는 POST body를 읽을 수 없으므로, 이 라우트가 대신 받는다.
// id_token/code를 리다이렉트 URL 쿼리파라미터에 그대로 실으면 브라우저 히스토리·서버 접근
// 로그·Referer 헤더로 새어나갈 수 있어, 대신 HttpOnly 쿠키에 담아 /auth/apple/callback
// (카카오/구글과 동일한 공통 콜백 페이지)으로 리다이렉트하고, 그 페이지가 아래 GET 핸들러를
// 통해 한 번만 읽어가도록 한다. 애플 콘솔의 Return URL이 이 경로를 그대로 가리킨다.
// code(인가 코드)는 우리가 따로 소비하지 않고 그대로 백엔드로 전달한다 — 탈퇴 시 애플 연동
// 해제(revoke)를 하려면 백엔드가 이 코드로 refresh token을 발급받아야 하기 때문이다.
const handleApple = async (request: NextRequest) => {
  const formData = await request.formData();
  const idToken = formData.get('id_token');
  const code = formData.get('code');
  const state = formData.get('state');
  const error = formData.get('error');

  const redirectUrl = new URL('/auth/apple/callback', request.url);
  if (typeof state === 'string' && state) {
    redirectUrl.searchParams.set('state', state);
  }

  if (typeof idToken !== 'string' || !idToken) {
    redirectUrl.searchParams.set(
      'error',
      typeof error === 'string' ? error : '애플 로그인에 실패했습니다.',
    );
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  response.cookies.set(
    APPLE_EXCHANGE_COOKIE,
    JSON.stringify({
      idToken,
      ...(typeof code === 'string' && code ? { code } : {}),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60,
      path: '/api/auth/apple/callback',
    },
  );
  return response;
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

// /auth/apple/callback 페이지가 마운트 직후 한 번 호출해 위 쿠키에 담긴 id_token/code를 꺼내간다.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (provider !== 'apple') {
    return NextResponse.json(
      { message: '지원하지 않는 provider입니다.' },
      { status: 404 },
    );
  }

  const cookieValue = request.cookies.get(APPLE_EXCHANGE_COOKIE)?.value;
  const response = cookieValue
    ? NextResponse.json(JSON.parse(cookieValue))
    : NextResponse.json(
        { message: '애플 로그인 교환 정보를 찾을 수 없습니다.' },
        { status: 404 },
      );

  // 단발성이므로 읽자마자 즉시 만료시켜 재사용(replay)을 막는다.
  response.cookies.set(APPLE_EXCHANGE_COOKIE, '', {
    maxAge: 0,
    path: '/api/auth/apple/callback',
  });
  return response;
}
