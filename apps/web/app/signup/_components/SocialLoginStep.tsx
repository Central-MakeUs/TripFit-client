import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import AppleIcon from '@/assets/icons/apple.svg';
import GoogleIcon from '@/assets/icons/google.svg';
import KakaoIcon from '@/assets/icons/kakao.svg';
import LogoIcon from '@/assets/icons/logo.svg';
import TextButton from '@/components/text-button';
import { isIOS, isReactNativeWebView } from '@/utils/platform';

type SocialLoginStepProps = {
  onSelectGoogle: () => void;
  onSelectApple: () => void;
  onSelectKakao: () => void;
};

function SocialLoginStep({
  onSelectGoogle,
  onSelectApple,
  onSelectKakao,
}: SocialLoginStepProps) {
  const router = useRouter();
  // 일반 웹에서는 항상 노출, RN 앱(WebView) 안에서는 iOS에서만 노출한다
  // — 서버 렌더링 시점엔 판단 불가하므로 마운트 후에만 켠다
  const [showApple, setShowApple] = useState(false);

  useEffect(() => {
    setShowApple(!isReactNativeWebView() || isIOS());
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
        <LogoIcon className="h-12 w-auto" />
        <p className="text-caption-01 text-blue-400">
          최적의 여행 일정을 추천해주는
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-5 px-5">
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={onSelectGoogle}
            className="relative flex h-12 w-full cursor-pointer items-center justify-center rounded-[14px] border border-grey-100 bg-white"
          >
            <span className="absolute inset-y-0 left-3.5 flex items-center">
              <GoogleIcon className="size-5" />
            </span>
            <span className="text-body-03 text-[#1f1f1f]">
              Google로 시작하기
            </span>
          </button>

          {showApple && (
            <button
              type="button"
              onClick={onSelectApple}
              className="relative flex h-12 w-full cursor-pointer items-center justify-center rounded-[14px] bg-black"
            >
              <span className="absolute inset-y-0 left-3.5 flex items-center">
                <AppleIcon className="size-5 text-white" />
              </span>
              <span className="text-body-03 text-white">Apple로 시작하기</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSelectKakao}
            className="relative flex h-12 w-full cursor-pointer items-center justify-center rounded-[14px] bg-[#fee500]"
          >
            <span className="absolute inset-y-0 left-3.5 flex items-center">
              <KakaoIcon className="size-4.5 text-black/85" />
            </span>
            <span className="text-body-03 text-black/85">Kakao로 시작하기</span>
          </button>
        </div>

        <TextButton
          text="개인정보 처리방침"
          icon={null}
          onClick={() => router.push('/privacy-policy')}
          className="text-caption-01 text-grey-300 underline"
        />
      </div>
    </div>
  );
}

export default SocialLoginStep;
