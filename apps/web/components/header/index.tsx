'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AccountCircleIcon from '@/assets/icons/account-circle.svg';
import ArrowLeftIcon from '@/assets/icons/arrow-left-200.svg';
import CalendarMonthIcon from '@/assets/icons/calendar-month.svg';
import LogoIcon from '@/assets/icons/logo.svg';
import NotificationIcon from '@/assets/icons/notification.svg';
import Badge from '@/components/badge';
import IconButton from '@/components/icon-button';
import { cn } from '@/utils/cn';

const HEADER_BACKGROUND_CLASS = {
  white: 'bg-white',
  'grey-20': 'bg-grey-20',
} as const;

type HeaderProps =
  | {
      variant: 'home';
      onLogoClick?: () => void;
      unreadNotificationCount?: number;
    }
  | {
      variant: 'page';
      title: ReactNode;
      titleAlign?: 'center' | 'left';
      onBack?: () => void;
      rightSlot?: ReactNode;
      background?: keyof typeof HEADER_BACKGROUND_CLASS;
      /** 'lg'면 높이 48px(하단 패딩 4px) — 여행방 상세처럼 타이틀 아래 날짜 등
       * 보조 텍스트가 함께 있는 화면 전용. 미지정 시 기본 44px */
      size?: 'default' | 'lg';
    };

function Header(props: HeaderProps) {
  const router = useRouter();

  let content: ReactNode;
  const backgroundClass =
    props.variant === 'page'
      ? HEADER_BACKGROUND_CLASS[props.background ?? 'white']
      : HEADER_BACKGROUND_CLASS.white;
  const isLarge = props.variant === 'page' && props.size === 'lg';

  if (props.variant === 'home') {
    content = (
      <div className="flex w-full items-center justify-between pl-5 pr-2.5">
        <Link href="/" aria-label="홈" onClick={props.onLogoClick}>
          <LogoIcon className="h-6 w-20" />
        </Link>
        <div className="flex items-center gap-1">
          <IconButton
            href="/my-schedule"
            aria-label="내 일정"
            icon={<CalendarMonthIcon className="text-grey-500" />}
          />
          <div className="relative">
            <IconButton
              href="/my-page/notifications"
              aria-label="알림"
              icon={<NotificationIcon className="text-grey-500" />}
            />
            <Badge
              count={props.unreadNotificationCount ?? 0}
              className="pointer-events-none absolute top-1 right-1"
            />
          </div>
          <IconButton
            href="/my-page"
            aria-label="마이페이지"
            icon={<AccountCircleIcon className="text-grey-500" />}
          />
        </div>
      </div>
    );
  } else {
    const { title, titleAlign = 'center', onBack, rightSlot } = props;

    const handleBack = () => {
      if (onBack) {
        onBack();
        return;
      }
      router.back();
    };

    const backButton = (
      <IconButton
        onClick={handleBack}
        aria-label="뒤로가기"
        icon={<ArrowLeftIcon className="text-grey-500" />}
      />
    );
    const rightSlotElement = rightSlot && (
      <div className="flex items-center">{rightSlot}</div>
    );

    content =
      titleAlign === 'left' ? (
        <div className="flex w-full items-center justify-between px-2.5">
          <div className="flex items-center gap-4">
            {backButton}
            <h1 className="text-body-03 text-black">{title}</h1>
          </div>
          {rightSlotElement}
        </div>
      ) : (
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-2.5">
          <div className="justify-self-start">{backButton}</div>
          <h1 className="text-body-03 text-black col-start-2 justify-self-center">
            {title}
          </h1>
          {rightSlotElement && (
            <div className="justify-self-end">{rightSlotElement}</div>
          )}
        </div>
      );
  }

  return (
    <>
      {/*
        vaul(바텀시트)이 열릴 때 모바일 사파리 대응으로 document.body에
        position: fixed를 강제로 붙인다(node_modules/vaul/dist/index.js).
        헤더를 position: sticky로 두면 그 순간 기준 박스가 body로 바뀌어
        헤더가 튀거나 풀리는 것처럼 보이므로, 뷰포트 기준 fixed로 고정해
        body가 무엇을 하든 영향받지 않게 한다.
      */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-20 mx-auto flex w-full items-center sm:max-w-90',
          isLarge ? 'h-12 pb-1' : 'h-11',
          backgroundClass,
        )}
      >
        {content}
      </header>
      <div
        aria-hidden
        className={cn('w-full shrink-0', isLarge ? 'h-12' : 'h-11')}
      />
    </>
  );
}

export default Header;
