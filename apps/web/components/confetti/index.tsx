import confettiGif from '@/assets/images/confetti.gif';
import { cn } from '@/utils/cn';

type ConfettiProps = {
  className?: string;
};

// GIF 애니메이션은 next/image의 최적화 파이프라인을 거치면 재생이 깨질 수 있어
// 원본 그대로 재생되도록 next/image 대신 일반 img 태그로 렌더링한다.
function Confetti({ className }: ConfettiProps) {
  return (
    <img
      src={confettiGif.src}
      alt=""
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full object-cover select-none',
        className,
      )}
    />
  );
}

export default Confetti;
