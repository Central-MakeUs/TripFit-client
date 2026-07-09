import SettingsIcon from '@/assets/icons/settings.svg';
import Header from '@/components/header';

function HeaderPreview() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Header variant="home" />
      <Header variant="page" title="여행방 추가하기" />
      <Header variant="page" title="여행방 추가하기" titleAlign="left" />
      <Header
        variant="page"
        title="여행방 상세"
        rightSlot={
          <button type="button" aria-label="설정" className="cursor-pointer">
            <SettingsIcon className="h-6 w-6 text-grey-500" />
          </button>
        }
      />
      <Header
        variant="page"
        title="여행방 상세"
        titleAlign="left"
        rightSlot={
          <button type="button" aria-label="설정" className="cursor-pointer">
            <SettingsIcon className="h-6 w-6 text-grey-500" />
          </button>
        }
      />
      <Header
        variant="page"
        titleAlign="left"
        title={
          <div className="flex flex-col">
            <span className="text-body-03">여행방 상세</span>
            <span className="text-caption-05 text-grey-500">
              2026.07.10 - 07.13
            </span>
          </div>
        }
      />
    </div>
  );
}

export default HeaderPreview;
