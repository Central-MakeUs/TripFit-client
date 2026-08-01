const svgrOptions = {
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
    ],
  },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 안드로이드 에뮬레이터에서 WebView가 호스트 머신을 10.0.2.2로 접근할 때, 이 origin이
  // 허용 목록에 없으면 Next 개발 서버가 HMR 웹소켓 업그레이드 요청을 거부(ERR_INVALID_HTTP_RESPONSE)
  // 하고 그 여파로 클라이언트 렌더링 자체가 멈춰버린다.
  allowedDevOrigins: ['10.0.2.2'],
  // Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: svgrOptions,
          },
        ],
        as: '*.js',
      },
    },
  },
  // webpack
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              typescript: true,
              ext: 'tsx',
              ...svgrOptions,
            },
          },
        ],
      },
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;
