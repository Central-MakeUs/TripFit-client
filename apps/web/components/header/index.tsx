'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AccountCircleIcon from '@/assets/icons/account-circle.svg';
import ArrowLeftIcon from '@/assets/icons/arrow-left-200.svg';
import CalendarMonthIcon from '@/assets/icons/calendar-month.svg';
import LogoIcon from '@/assets/icons/logo.svg';
import NotificationIcon from '@/assets/icons/notification.svg';

type HeaderProps =
  | { variant: 'home' }
  | {
      variant: 'page';
      title: ReactNode;
      titleAlign?: 'center' | 'left';
      onBack?: () => void;
      rightSlot?: ReactNode;
    };

function Header(props: HeaderProps) {
  const router = useRouter();

  let content: ReactNode;

  if (props.variant === 'home') {
    content = (
      <div className="flex w-full items-center justify-between pl-5 pr-2.5">
        <Link href="/" aria-label="홈">
          <LogoIcon className="h-6 w-20" />
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/my-schedule" aria-label="내 일정" className="p-2.5">
            <CalendarMonthIcon className="h-6 w-6 text-grey-500" />
          </Link>
          <Link href="/notifications" aria-label="알림" className="p-2.5">
            <NotificationIcon className="h-6 w-6 text-grey-500" />
          </Link>
          <Link href="/my-page" aria-label="마이페이지" className="p-2.5">
            <AccountCircleIcon className="h-6 w-6 text-grey-500" />
          </Link>
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
      <button
        type="button"
        onClick={handleBack}
        aria-label="뒤로가기"
        className="cursor-pointer p-2.5"
      >
        <ArrowLeftIcon className="h-6 w-6 text-grey-500" />
      </button>
    );
    const rightSlotElement = rightSlot && (
      <div className="flex items-center">{rightSlot}</div>
    );

    content =
      titleAlign === 'left' ? (
        <div className="flex w-full items-center justify-between px-2.5 py-2">
          <div className="flex items-center gap-4">
            {backButton}
            <h1 className="text-body-03 text-black">{title}</h1>
          </div>
          {rightSlotElement}
        </div>
      ) : (
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-2.5 py-2">
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
      <header className="fixed inset-x-0 top-0 z-20 mx-auto flex h-11 w-full items-center bg-white sm:max-w-90">
        {content}
      </header>
      <div aria-hidden className="h-11 w-full shrink-0" />
    </>
  );
}

export default Header;
