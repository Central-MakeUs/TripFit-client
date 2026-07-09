'use client';

import AddIcon from '@/assets/icons/add.svg';
import ModifyIcon from '@/assets/icons/modify.svg';
import FloatingButton from '@/components/floating-button';

function FloatingButtonPreview() {
  return (
    <>
      <FloatingButton icon={<ModifyIcon className="h-8 w-8" />} />
      <FloatingButton
        icon={<AddIcon className="h-8 w-8" />}
        disabled
        className="bottom-30!"
      />
      <FloatingButton
        icon={<ModifyIcon className="h-8 w-8" />}
        onClick={() => {}}
        className="bottom-50!"
      />
      <FloatingButton
        icon={<AddIcon className="h-8 w-8" />}
        href="/room/new"
        className="bottom-70!"
      />
    </>
  );
}

export default FloatingButtonPreview;
