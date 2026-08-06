'use client';

import { useRouter } from 'next/navigation';

import Button from '@/components/button';
import TextButton from '@/components/text-button';

import OnboardingCarousel from './OnboardingCarousel';

function OnboardingFlow() {
  const router = useRouter();

  return (
    <main className="flex min-h-dvh w-full flex-col">
      <div className="flex w-full flex-1 flex-col justify-center overflow-hidden">
        <OnboardingCarousel />
      </div>
      <div className="flex w-full flex-col items-center px-5">
        <Button
          text="TripFit 시작하기"
          onClick={() => router.push('/signup')}
          className="w-full mt-2 mb-0.5"
        />
        <TextButton
          text="개인정보 처리방침"
          icon={null}
          onClick={() => router.push('/privacy-policy')}
          className="text-caption-01 text-grey-300 underline"
        />
      </div>
    </main>
  );
}

export default OnboardingFlow;
