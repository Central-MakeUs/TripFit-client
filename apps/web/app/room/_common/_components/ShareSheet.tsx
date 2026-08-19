'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import shareSheetBanner from '@/assets/images/share-sheet-banner.png';
import AlertModal from '@/components/alert-modal';
import BottomSheet from '@/components/bottom-sheet';
import CtaButtonGroup from '@/components/cta-button-group';
import Input from '@/components/input';
import Textarea from '@/components/textarea';
import { ensureKakaoInitialized } from '@/utils/kakaoAuth';
import { KakaoShareResultT, shareToKakao } from '@/utils/kakaoShare';

type ShareSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialTitleValue: string;
  initialDescriptionValue: string;
  /** 공유 버튼(카카오 Feed 템플릿 버튼)에 들어갈 상대 경로(예: "/room/123") — 네이티브
   * 앱/일반 웹 브라우저 구분 없이 카카오 JS SDK의 Share.sendDefault로 공유한다.
   * 절대 URL은 클릭 시점(handleShare)에만 만든다 — 렌더링 중(SSR 포함) window에
   * 접근하면 안 되므로 */
  linkPath: string;
  /** 카카오 Feed 템플릿의 버튼 문구 (예: "일정 입력 요청하기") — 지정하지 않으면
   * 버튼 없이 이미지/제목/설명만 있는 카드로 공유된다(예: 확정 일정 공유) */
  buttonTitle?: string;
  onShare: (value: { title: string; description: string }) => void;
};

function ShareSheet({
  open,
  onOpenChange,
  title,
  initialTitleValue,
  initialDescriptionValue,
  linkPath,
  buttonTitle,
  onShare,
}: ShareSheetProps) {
  const [titleValue, setTitleValue] = useState(initialTitleValue);
  const [descriptionValue, setDescriptionValue] = useState(
    initialDescriptionValue,
  );
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(
    null,
  );
  // 카카오톡 앱 전환이 확인 안 된 링크 — null이 아니면 "링크 복사하기" 확인
  // 모달을 띄운다. 여기서 바로 복사하지 않고 사용자가 그 모달의 버튼을 직접
  // 눌러야 복사하는 이유: iOS WebKit은 진짜 사용자 클릭 안에서 동기적으로
  // 호출된 navigator.clipboard.writeText()만 신뢰하고, 타임아웃(비동기) 이후의
  // 자동 호출은 대부분 막는다.
  const [pendingCopyLinkUrl, setPendingCopyLinkUrl] = useState<string | null>(
    null,
  );
  const [isLinkCopiedAlertOpen, setIsLinkCopiedAlertOpen] = useState(false);
  // 'pending' 동안은 공유 버튼을 비활성화한다 — 로드가 끝나기 전에 눌러버리면
  // 클릭 시점에 다시 로드를 기다리게 되고, 그 사이 사용자 제스처가 끊겨 PC의
  // sendDefault() 내부 window.open()이 팝업 차단에 걸린다(Cannot read
  // properties of null (reading 'focus')로 이어짐). 로드 실패('error')는 영영
  // 눌러보지도 못하게 막지 않고 버튼을 다시 활성화해 재시도할 수 있게 한다.
  const [kakaoLoadStatus, setKakaoLoadStatus] = useState<
    'pending' | 'ready' | 'error'
  >('pending');

  useEffect(() => {
    if (open) {
      setTitleValue(initialTitleValue);
      setDescriptionValue(initialDescriptionValue);
      setKakaoLoadStatus('pending');
      ensureKakaoInitialized()
        .then(() => setKakaoLoadStatus('ready'))
        .catch(() => setKakaoLoadStatus('error'));
    }
  }, [open, initialTitleValue, initialDescriptionValue]);

  const handleShare = async () => {
    const linkUrl = `${window.location.origin}${linkPath}`;
    let result: KakaoShareResultT;

    try {
      result = await shareToKakao({
        title: titleValue,
        description: descriptionValue,
        imageUrl: `${window.location.origin}${shareSheetBanner.src}`,
        linkUrl,
        buttonTitle,
      });
    } catch (error) {
      // 우리가 직접 던진(new Error(...)) 메시지만 그대로 보여준다 — 카카오 SDK
      // 내부에서 새는 TypeError 등(예: null.focus() 접근) 원본 문구를 사용자에게
      // 그대로 노출하지 않기 위해 error.name === 'Error'로 한정한다.
      setShareErrorMessage(
        error instanceof Error && error.name === 'Error'
          ? error.message
          : '공유하기에 실패했어요. 잠시 후 다시 시도해주세요.',
      );
      return;
    }

    if (result === 'appSwitchNotConfirmed') {
      setPendingCopyLinkUrl(linkUrl);
      return;
    }

    onShare({ title: titleValue, description: descriptionValue });
  };

  // AlertModal의 "링크 복사하기" 버튼 클릭이라는 새 사용자 제스처 안에서 곧바로
  // 호출해야 iOS에서도 신뢰할 수 있다 — await 앞에 다른 비동기 작업이 없어야 함.
  const handleCopyLink = async () => {
    if (!pendingCopyLinkUrl) return;

    try {
      await navigator.clipboard.writeText(pendingCopyLinkUrl);
    } catch {
      setPendingCopyLinkUrl(null);
      // 특정 서드파티 앱이 없어서 기능이 막힌 것처럼 보이면 안 되므로 일시적
      // 오류로만 안내한다(앱 심사 등 카카오톡이 없는 환경 고려).
      setShareErrorMessage(
        '지금은 공유할 수 없어요. 잠시 후 다시 시도해주세요.',
      );
      return;
    }

    setPendingCopyLinkUrl(null);
    setIsLinkCopiedAlertOpen(true);
    onShare({ title: titleValue, description: descriptionValue });
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      variant="non-modal"
      title={
        <div className="flex flex-col gap-0.5 px-5 py-4">
          <h2 className="text-body-01 text-black">{title}</h2>
          <p className="text-body-06 text-grey-500">
            제목과 설명은 자유롭게 수정할 수 있어요
          </p>
        </div>
      }
    >
      <div className="flex w-full flex-col gap-4 px-4 py-2">
        <div className="relative h-46 w-full overflow-hidden rounded-[20px] bg-blue-50">
          <Image
            src={shareSheetBanner}
            alt=""
            width={328}
            height={328}
            className="pointer-events-none absolute -top-18 left-0 object-cover"
          />
        </div>
        <Input
          label="제목"
          value={titleValue}
          onChange={(event) => setTitleValue(event.target.value)}
        />
        <Textarea
          label="설명"
          value={descriptionValue}
          onChange={(event) => setDescriptionValue(event.target.value)}
        />
      </div>
      <CtaButtonGroup
        primaryText="공유하기"
        primaryColor="secondary"
        primaryDisabled={kakaoLoadStatus === 'pending'}
        onPrimaryClick={handleShare}
        secondaryText="취소"
        secondaryColor="secondary"
        secondaryVariant="button-horizontal"
        onSecondaryClick={() => onOpenChange(false)}
        className="px-3 py-4"
      />
      <AlertModal
        open={shareErrorMessage !== null}
        onOpenChange={(nextOpen) => !nextOpen && setShareErrorMessage(null)}
        variant="danger"
        title="공유하지 못했어요"
        description={shareErrorMessage ?? ''}
        primaryText="확인"
        onPrimaryClick={() => setShareErrorMessage(null)}
      />
      <AlertModal
        open={pendingCopyLinkUrl !== null}
        onOpenChange={(open) => !open && setPendingCopyLinkUrl(null)}
        title="카카오톡을 확인하지 못했어요"
        description="대신 링크를 복사해서 공유할 수 있어요."
        primaryText="링크 복사하기"
        onPrimaryClick={handleCopyLink}
        secondaryText="취소"
        onSecondaryClick={() => setPendingCopyLinkUrl(null)}
      />
      <AlertModal
        open={isLinkCopiedAlertOpen}
        onOpenChange={setIsLinkCopiedAlertOpen}
        title="링크가 복사됐어요"
        description="원하는 곳에 붙여넣어 공유해주세요."
        primaryText="확인"
        onPrimaryClick={() => setIsLinkCopiedAlertOpen(false)}
      />
    </BottomSheet>
  );
}

export default ShareSheet;
