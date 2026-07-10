'use client';

import { useState } from 'react';

import AddIcon from '@/assets/icons/add.svg';
import RemoveIcon from '@/assets/icons/remove.svg';
import Badge from '@/components/badge';
import Button from '@/components/button';
import Checkbox from '@/components/checkbox';
import CtaButtonGroup from '@/components/cta-button-group';
import DaySelector from '@/components/day-selector';
import Modal from '@/components/modal';
import Pagination from '@/components/pagination';
import Profile from '@/components/profile';
import RadioButton from '@/components/radio-button';
import RecommendationListItem from '@/components/recommendation-list-item';
import RoomCard from '@/components/room-card';
import RoomCardCarousel from '@/components/room-card-carousel';
import RoomListItem from '@/components/room-list-item';
import Roulette from '@/components/roulette';
import Tag from '@/components/tag';
import TextButton from '@/components/text-button';

const colors = ['purple', 'pink', 'orange', 'yellow', 'green'] as const;

function DevPreview() {
  const [checked, setChecked] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [radioChecked, setRadioChecked] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3]);
  const [count, setCount] = useState('4');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const counts = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const hours = Array.from({ length: 24 }, (_, i) => String(i));
  const minutes = ['00', '30'];
  const [selectedDefault, setSelectedDefault] = useState(0);
  const defaultOptions = [
    {
      description: '연차, 참석률, 불확정 일정을 골고루 반영해요',
      title: '기본 선택',
    },
    {
      description: '연차, 참석률, 불확정 일정을 골고루 반영해요',
      title: '기본 선택',
    },
  ];
  const [selectedCandidate, setSelectedCandidate] = useState(0);
  const candidates = [
    {
      description: '참석률 80%, 부분 참여 1명, 불확실 일정 1명',
      rank: 1,
      title: '6.12(월) - 6.15(목)',
    },
    {
      description: '참석률 75%, 부분 참여 2명, 불확실 일정 0명',
      rank: 2,
      title: '6.19(월) - 6.22(목)',
    },
    {
      description: '참석률 70%, 부분 참여 2명, 불확실 일정 1명',
      rank: 3,
      title: '6.26(월) - 6.29(목)',
    },
  ];

  return (
    <main className="flex w-full flex-col gap-10 p-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Badge</h2>
        <div className="flex gap-2">
          <Badge count={2} />
          <Badge count={12} />
          <Badge count={130} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Tag</h2>
        <div className="flex flex-col gap-3">
          {(['icon-L', 'text', 'icon'] as const).map((category) => (
            <div key={category} className="flex gap-2">
              {(['blue', 'red'] as const).map((color) =>
                (['primary', 'secondary', 'tertiary'] as const).map((type) => (
                  <Tag
                    key={`${color}-${type}`}
                    category={category}
                    color={color}
                    text="text"
                    type={type}
                  />
                )),
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Checkbox</h2>
        <Checkbox checked={checked} onCheckedChange={setChecked} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Profile</h2>
        <div className="flex gap-2">
          {colors.map((color) => (
            <div key={color} className="flex flex-col gap-2">
              <Profile size="S" text="이름" color={color} tone={1} />
              <Profile size="S" text="이름" color={color} tone={2} />
              <Profile size="M" text="이름" color={color} tone={1} />
              <Profile size="M" text="이름" color={color} tone={2} />
            </div>
          ))}
          <Profile size="S" text="이름" color="green" tone={1} disabled />
          <Profile size="M" text="이름" color="green" tone={1} disabled />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Text Button</h2>
        <div className="flex gap-2">
          <TextButton size="S" text="전체 보기" />
          <TextButton size="M" text="전체 보기" />
          <TextButton size="L" text="전체 보기" />
          <TextButton
            size="M"
            text="추가하기"
            icon={<AddIcon className="size-4" />}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Button</h2>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button text="button" style="fill" type="primary" size="L" />
            <Button text="button" style="weak" type="primary" size="L" />
            <Button text="button" style="outline" type="primary" size="L" />
          </div>
          <div className="flex gap-2">
            <Button text="button" style="fill" type="secondary" size="M" />
            <Button text="button" style="weak" type="secondary" size="M" />
            <Button text="button" style="outline" type="secondary" size="M" />
          </div>
          <div className="flex gap-2">
            <Button
              text="button"
              style="fill"
              type="primary"
              size="L"
              disabled
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Pagination</h2>
        <Pagination total={5} current={2} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Room Card</h2>
        <div className="flex gap-4">
          <RoomCard
            type="fill"
            title="제주도 여행"
            nights={2}
            days={3}
            dateRange="26.07.01 - 26.08.31"
            isHost
            isPinned={pinned}
            onPin={() => setPinned((prev) => !prev)}
            statusTag="응답 대기"
            participants={[
              { name: '민서', color: 'purple' },
              { name: '지혜', color: 'pink' },
              { name: '유정', color: 'yellow' },
              { name: '소윤', color: 'green' },
              { name: '민지', color: 'orange' },
            ]}
            respondedCount={4}
            capacity={5}
            progress={50}
          />
          <RoomCard type="empty" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Room Card Carousel</h2>
        <div className="w-90">
          <RoomCardCarousel
            items={[
              {
                type: 'fill',
                title: '제주도 여행',
                nights: 2,
                days: 3,
                dateRange: '26.07.01 - 26.08.31',
                isHost: true,
                statusTag: '응답 대기',
                participants: [
                  { name: '민서', color: 'purple' },
                  { name: '지혜', color: 'pink' },
                  { name: '유정', color: 'yellow' },
                ],
                respondedCount: 4,
                capacity: 5,
                progress: 50,
              },
              {
                type: 'fill',
                title: '부산 여행',
                nights: 1,
                days: 2,
                dateRange: '26.08.10 - 26.08.20',
                statusTag: '일정 확정',
                participants: [
                  { name: '소윤', color: 'green' },
                  { name: '민지', color: 'orange' },
                ],
                respondedCount: 2,
                capacity: 2,
                progress: 100,
              },
              { type: 'empty' },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Room List Item</h2>
        <div className="flex w-[321px] flex-col gap-2">
          <RoomListItem
            title="제주도 여행"
            dateRange="26.07.01 - 26.08.31"
            isHost
            statusTag="응답 대기"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Modal</h2>
        <Modal
          items={[
            { label: '공유하기' },
            { label: '삭제하기', variant: 'destructive' },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Day Selector</h2>
        <div className="w-100">
          <DaySelector selected={selectedDays} onChange={setSelectedDays} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Roulette (+/-)</h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="감소"
            onClick={() => {
              const index = counts.indexOf(count);
              if (index > 0) setCount(counts[index - 1]!);
            }}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04),0px_0px_6px_0px_rgba(0,0,0,0.08)]"
          >
            <RemoveIcon className="size-7 text-grey-500" />
          </button>
          <Roulette
            value={count}
            values={counts}
            onChange={setCount}
            centerFontSize={80}
            fontSize={32}
          />
          <button
            type="button"
            aria-label="증가"
            onClick={() => {
              const index = counts.indexOf(count);
              if (index < counts.length - 1) setCount(counts[index + 1]!);
            }}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04),0px_0px_6px_0px_rgba(0,0,0,0.08)]"
          >
            <AddIcon className="size-7 text-grey-500" />
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Roulette (Time Picker 조합)</h2>
        <div className="flex w-full items-center justify-center gap-2">
          <Roulette
            value={hour}
            values={hours}
            onChange={setHour}
            centerFontSize={48}
            fontSize={32}
          />
          <span className="text-5xl font-semibold text-black/80">:</span>
          <Roulette
            value={minute}
            values={minutes}
            onChange={setMinute}
            centerFontSize={48}
            fontSize={32}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">CTA Button Group</h2>
        <div className="flex flex-col gap-4">
          <div className="w-100 bg-grey-20">
            <CtaButtonGroup primaryText="CTA" />
          </div>
          <div className="w-100 bg-grey-20">
            <CtaButtonGroup
              primaryText="CTA"
              secondaryText="CTA"
              secondaryVariant="button-horizontal"
            />
          </div>
          <div className="w-100 bg-grey-20">
            <CtaButtonGroup
              primaryText="CTA"
              secondaryText="CTA"
              secondaryVariant="button-vertical"
            />
          </div>
          <div className="w-100 bg-grey-20">
            <CtaButtonGroup
              primaryText="CTA"
              secondaryText="전체 보기"
              secondaryVariant="text-link"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">Radio Button</h2>
        <div className="flex gap-2">
          <RadioButton
            checked={radioChecked}
            onCheckedChange={setRadioChecked}
          />
          <RadioButton
            checked={!radioChecked}
            onCheckedChange={() => setRadioChecked((prev) => !prev)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">
          Recommendation List Item (기본 선택)
        </h2>
        <div className="flex w-90 flex-col gap-3">
          {defaultOptions.map((item, index) => (
            <RecommendationListItem
              key={index}
              title={item.title}
              description={item.description}
              active={selectedDefault === index}
              onClick={() => setSelectedDefault(index)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-03">
          Recommendation List Item (추천 후보)
        </h2>
        <div className="flex w-90 flex-col gap-3">
          {candidates.map((item, index) => (
            <RecommendationListItem
              key={item.title}
              title={item.title}
              description={item.description}
              rank={item.rank}
              active={selectedCandidate === index}
              onClick={() => setSelectedCandidate(index)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default DevPreview;
