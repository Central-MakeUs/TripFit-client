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

  if (props.variant === 'home') {
    return (
      <header className="flex w-full items-center justify-between pl-5 pr-2.5">
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
      </header>
    );
  }

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

  if (titleAlign === 'left') {
    return (
      <header className="flex w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4">
          {backButton}
          <h1 className="text-body-03 text-black">{title}</h1>
        </div>
        {rightSlotElement}
      </header>
    );
  }

  return (
    <header className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-5 py-3">
      <div className="justify-self-start">{backButton}</div>
      <h1 className="text-body-03 text-black col-start-2 justify-self-center">
        {title}
      </h1>
      {rightSlotElement && (
        <div className="justify-self-end">{rightSlotElement}</div>
      )}
    </header>
  );
}

export default Header;
