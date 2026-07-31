import { ensureKakaoInitialized } from '@/utils/kakaoAuth';

export type KakaoShareContentT = {
  title: string;
  description: string;
  /** Kakao 서버가 직접 이 URL로 이미지를 가져가므로 실제로 외부에서 접근 가능한
   * 절대 URL이어야 한다 — localhost에서는 카카오 쪽에서 접근할 수 없어 이미지가
   * 안 보일 수 있고, 배포된 도메인에서만 정상 동작한다 */
  imageUrl: string;
  linkUrl: string;
  buttonTitle: string;
};

export const shareToKakao = async ({
  title,
  description,
  imageUrl,
  linkUrl,
  buttonTitle,
}: KakaoShareContentT): Promise<void> => {
  const kakao = await ensureKakaoInitialized();

  kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      imageUrl,
      link: { mobileWebUrl: linkUrl, webUrl: linkUrl },
    },
    buttons: [
      {
        title: buttonTitle,
        link: { mobileWebUrl: linkUrl, webUrl: linkUrl },
      },
    ],
  });
};
