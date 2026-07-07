import type { Metadata } from 'next';
import { Google_Sans_Flex } from 'next/font/google';
import './globals.css';

const googleSansFlex = Google_Sans_Flex({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-num',
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
    <html lang="ko">
      <body className={googleSansFlex.variable}>{children}</body>
    </html>
  );
}
