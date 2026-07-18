import CalendarMonthIcon from '@/assets/icons/calendar-month.svg';
import ConfirmIcon from '@/assets/icons/confirm.svg';
import GroupsIcon from '@/assets/icons/groups.svg';
import Stars2Icon from '@/assets/icons/stars-2.svg';
import TipIcon from '@/assets/icons/tip.svg';
import Header from '@/components/header';

import GuideCtaActions from './_components/GuideCtaActions';
import GuideStep from './_components/GuideStep';

const GUIDE_STEPS = [
  {
    icon: <GroupsIcon className="size-9" />,
    title: '1. 여행 만들기',
    description: ['여행방을 만들고', '친구들을 초대해요.'],
  },
  {
    icon: <CalendarMonthIcon className="size-8 text-blue-500" />,
    title: '2. 일정 조율하기',
    description: ['각자의 일정을 입력하면', '가능한 날짜를 찾아드려요'],
  },
  {
    icon: <Stars2Icon className="size-8" />,
    title: '3. 추천 일정 확인하기',
    description: ['모두가 함께 할 수 있는', '최적의 일정을 추천해요'],
  },
  {
    icon: <ConfirmIcon className="size-8" />,
    title: '4. 일정 확정하기',
    description: ['마음에 드는 일정을 선택하고', '여행을 확정해요!'],
  },
];

function GuidePage() {
  return (
    <main className="flex w-full flex-col">
      <Header variant="page" title="TripFit 가이드" />
      <div className="flex w-full flex-1 flex-col gap-10 px-5 pt-6 pb-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-headline-03 text-black">
            여행 일정 조율,
            <br />
            <span className="text-blue-500">TripFit</span>과 함께 쉬워져요
          </h1>
          <p className="text-caption-02 text-grey-500">
            친구들과 최적의 여행 일정을 찾아보세요.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="relative flex flex-col gap-6">
            {/* 아이콘 원들을 잇는 점선 커넥터 — 아이콘(size-13=52px) 중심에 오도록
                좌우/상하 26px(6.5) 오프셋을 준다. 아이콘 원(GuideStep)도
                position:relative라 이 줄보다 DOM상 뒤에 오는 한 자연스럽게
                위에 그려진다(둘 다 z-index:auto인 positioned 요소는 DOM 순서로 쌓임). */}
            <div
              aria-hidden
              className="absolute top-6.5 bottom-6.5 left-6.5 w-[1.5px]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, var(--color-blue-100) 0px, var(--color-blue-100) 3px, transparent 3px, transparent 6px)',
              }}
            />
            {GUIDE_STEPS.map((step) => (
              <GuideStep
                key={step.title}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 rounded-[20px] bg-blue-20 p-3">
            <div className="flex items-center gap-0.5">
              <TipIcon className="size-4" />
              <p className="text-caption-01 text-blue-500">Tip</p>
            </div>
            <p className="text-caption-02 text-grey-500">
              일정 조율부터 확정까지 한눈에!
              <br />
              TripFit이 여행 준비를 도와드릴게요.
            </p>
          </div>
        </div>
      </div>

      {/* 실제 콘텐츠 흐름에서 하단 고정 바 높이만큼 공간을 확보하는 투명 스페이서 */}
      <div
        aria-hidden
        className="invisible pointer-events-none w-full bg-white/80"
      >
        <GuideCtaActions />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full rounded-t-xl bg-white/80 backdrop-blur-[18px] sm:max-w-90">
        <GuideCtaActions />
      </div>
    </main>
  );
}

export default GuidePage;
