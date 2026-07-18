import AddIcon from '@/assets/icons/add.svg';
import FloatingButton from '@/components/floating-button';
import Header from '@/components/header';

import HomeSections from './_components/HomeSections';

function Home() {
  return (
    <main className="flex w-full flex-col">
      <Header variant="home" />
      <div className="flex w-full flex-col gap-7 px-5 py-5">
        <HomeSections />
      </div>
      <FloatingButton
        href="/room/new"
        aria-label="여행방 만들기"
        icon={<AddIcon className="size-8 text-white" />}
      />
    </main>
  );
}

export default Home;
