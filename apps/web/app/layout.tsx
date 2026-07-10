import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
