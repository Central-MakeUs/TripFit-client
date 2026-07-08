import FloatingButton from '@/components/floating-button';

function FloatingButtonPreview() {
  return (
    <>
      <FloatingButton icon={<span aria-hidden>✎</span>} />
      <FloatingButton
        icon={<span aria-hidden>+</span>}
        disabled
        className="bottom-30!"
      />
      <FloatingButton
        icon={<span aria-hidden>+</span>}
        href="/room/new"
        className="bottom-50!"
      />
      <FloatingButton
        icon={<span aria-hidden>+</span>}
        href="/room/new"
        disabled
        className="bottom-70!"
      />
    </>
  );
}

export default FloatingButtonPreview;
