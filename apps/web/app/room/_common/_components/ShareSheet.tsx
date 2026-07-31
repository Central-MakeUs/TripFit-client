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
import { shareToKakao } from '@/utils/kakaoShare';

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

  useEffect(() => {
    if (open) {
      setTitleValue(initialTitleValue);
      setDescriptionValue(initialDescriptionValue);
      // 공유 버튼 클릭 시점에 SDK 로드를 기다리면, 그 사이 사용자 제스처가
      // 끊겨 PC의 sendDefault() 내부 window.open()이 팝업 차단에 걸릴 수 있다 —
      // 시트가 열리자마자 미리 로드해둬서 클릭 시엔 곧바로 실행되게 한다.
      ensureKakaoInitialized().catch(() => {});
    }
  }, [open, initialTitleValue, initialDescriptionValue]);

  const handleShare = async () => {
    const linkUrl = `${window.location.origin}${linkPath}`;

    try {
      await shareToKakao({
        title: titleValue,
        description: descriptionValue,
        imageUrl: `${window.location.origin}${shareSheetBanner.src}`,
        linkUrl,
        buttonTitle,
      });
    } catch (error) {
      setShareErrorMessage(
        error instanceof Error
          ? error.message
          : '공유하기에 실패했어요. 잠시 후 다시 시도해주세요.',
      );
      return;
    }

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
    </BottomSheet>
  );
}

export default ShareSheet;
