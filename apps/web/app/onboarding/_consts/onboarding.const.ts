import { type StaticImageData } from 'next/image';

import onboarding1 from '../_assets/onboarding-1.png';
import onboarding2 from '../_assets/onboarding-2.png';
import onboarding3 from '../_assets/onboarding-3.png';
import onboarding4 from '../_assets/onboarding-4.png';
import onboarding5 from '../_assets/onboarding-5.png';

export type OnboardingSlideT = {
  /** true면 배지 대신 로고 워드마크를 보여줌 — 첫 슬라이드 전용 */
  logo?: boolean;
  badge?: string;
  title: string;
  subtitle?: string;
  image: StaticImageData;
};

// TODO: 배지/타이틀/서브타이틀 문구는 Figma 원본 대조 후 확정 필요
export const ONBOARDING_SLIDES: OnboardingSlideT[] = [
  {
    logo: true,
    title: '복잡한 여행 날짜 조율을 쉽게',
    subtitle: '일정을 모아 함께 여행하기 좋은 날짜를 추천해요',
    image: onboarding1,
  },
  {
    badge: '끝없는 조율',
    title: '단톡방에서 몇 주씩\n여행 날짜만 맞추고 있다면',
    image: onboarding2,
  },
  {
    badge: '일정 취합',
    title: '친구들 일정을\n링크 하나로 모아보세요',
    image: onboarding3,
  },
  {
    badge: '한 눈에 파악',
    title: '누가 언제 가능한지\n한 눈에 파악하세요',
    image: onboarding4,
  },
  {
    badge: '추천 일정',
    title: '최적의 여행 날짜를\n추천받아요',
    image: onboarding5,
  },
];
