'use client';

import { useQueryClient } from '@tanstack/react-query';

import Header from '@/components/header';

import { TRIPS_QUERY_KEY } from '@/hooks/useGetTrips';

// 로고는 항상 홈에서만 렌더되므로(다른 화면엔 variant="home" 헤더가 없음)
// 클릭 시 페이지 이동 대신 여행 목록을 다시 불러오는 새로고침으로 동작한다.
function HomeHeader() {
  const queryClient = useQueryClient();

  const handleLogoClick = () => {
    queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
  };

  return <Header variant="home" onLogoClick={handleLogoClick} />;
}

export default HomeHeader;
