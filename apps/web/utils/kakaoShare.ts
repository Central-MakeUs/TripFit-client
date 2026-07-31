import { ensureKakaoInitialized } from '@/utils/kakaoAuth';
import { isReactNativeWebView } from '@/utils/platform';

const APP_SWITCH_TIMEOUT_MS = 1500;

// 일반 웹 브라우저에서는 카카오톡 앱이 없어도 Kakao SDK가 알아서 카카오톡 웹
// 공유 화면으로 보내주므로 실패로 취급하면 안 된다 — 네이티브 앱(WebView)
// 안에서만 "카카오톡 앱 실행"이 유일한 경로라, 거기서만 실행 성공 여부를 감지해
// 실패 시 에러를 던진다.
//
// Kakao.Share.sendDefault()는 카카오톡 앱(모바일 앱 또는 PC 데스크톱 앱) 실행을
// 시도하는 브라우저 네비게이션이라, 그 앱이 설치되어 있지 않아도 JS 예외를 던지지
// 않고 조용히 실패한다 — 실행에 성공하면 브라우저 탭이 포커스를 잃는
// (visibilitychange/blur) 부수효과가 있으므로, 일정 시간 안에 그 이벤트가 없으면
// 앱이 없다고 판단한다.
const didAppSwitchSucceed = (): Promise<boolean> =>
  new Promise((resolve) => {
    const cleanup = () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleSwitch);
      window.removeEventListener('blur', handleSwitch);
    };
    const handleSwitch = () => {
      cleanup();
      resolve(true);
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, APP_SWITCH_TIMEOUT_MS);
    document.addEventListener('visibilitychange', handleSwitch);
    window.addEventListener('blur', handleSwitch);
  });

export type KakaoShareContentT = {
  title: string;
  description: string;
  /** Kakao 서버가 직접 이 URL로 이미지를 가져가므로 실제로 외부에서 접근 가능한
   * 절대 URL이어야 한다 — localhost에서는 카카오 쪽에서 접근할 수 없어 이미지가
   * 안 보일 수 있고, 배포된 도메인에서만 정상 동작한다 */
  imageUrl: string;
  linkUrl: string;
  /** 지정하지 않으면 카드에 버튼 자체를 안 넣는다 — 확정 일정 공유처럼 클릭
   * 유도 없이 문구만 전달하면 되는 경우에 사용 */
  buttonTitle?: string;
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
    ...(buttonTitle && {
      buttons: [
        {
          title: buttonTitle,
          link: { mobileWebUrl: linkUrl, webUrl: linkUrl },
        },
      ],
    }),
  });

  if (isReactNativeWebView() && !(await didAppSwitchSucceed())) {
    throw new Error('카카오톡이 설치되어 있지 않아 공유할 수 없어요.');
  }
};
