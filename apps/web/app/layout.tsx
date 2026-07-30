import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

import AuthGuard from './_components/AuthGuard';
import QueryProvider from './providers';

const pretendardNumerals = localFont({
  src: '../assets/fonts/google-sans-flex-digits.woff2',
  variable: '--font-numerals',
  display: 'swap',
  weight: '1 1000',
});

export const metadata: Metadata = {
  title: 'TripFit',
  description:
    '여러 사람의 조건을 반영해 모두가 납득할 수 있는 여행 일정을 추천하는 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // --font-numerals가 :root에서 참조하는 --font-kr의 하위 변수라, body에 붙이면
    // 크로미움이 중첩 var()를 제대로 재평가하지 못한다. html(=:root)에 붙여야 한다.
    <html lang="ko" className={pretendardNumerals.variable}>
      <body>
        <QueryProvider>
          <div className="mx-auto flex min-h-screen w-full flex-col bg-white sm:max-w-90">
            <AuthGuard>{children}</AuthGuard>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
