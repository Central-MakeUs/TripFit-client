import { cva } from 'class-variance-authority';

export const roomCardStyle = cva(
  // 캐러셀 스크롤 컨테이너가 페이지 패딩을 -mx-5로 뚫고 나가 풀블리드된 뒤
  // 자기 자신의 px-5로 다시 여백을 주는 구조라(RoomCardCarousel 참고),
  // 카드는 그 padding box를 그대로 채우면 된다 — 별도 calc 보정이 필요 없다.
  'flex h-51 w-full shrink-0 flex-col rounded-3xl px-4',
  {
    variants: {
      type: {
        fill: 'items-start justify-between bg-blue-50/60 py-3 [&:active:not(:has(button:active))]:bg-blue-50/80',
        empty:
          'cursor-pointer items-center justify-center gap-2 border border-grey-100 bg-grey-20 pt-3 pb-4 active:bg-grey-50',
      },
    },
    defaultVariants: {
      type: 'fill',
    },
  },
);
