'use client';

import { useRouter } from 'next/navigation';

import CtaButtonGroup from '@/components/cta-button-group';

function GuideCtaActions() {
  const router = useRouter();

  return (
    <CtaButtonGroup
      primaryText="여행방 만들러 가기"
      onPrimaryClick={() => router.push('/room/new')}
      secondaryText="나중에 볼게요"
      secondaryVariant="text-link"
      onSecondaryClick={() => router.push('/')}
    />
  );
}

export default GuideCtaActions;
