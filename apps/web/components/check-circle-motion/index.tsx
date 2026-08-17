import { cn } from '@/utils/cn';

type CheckCircleMotionProps = {
  className?: string;
};

function CheckCircleMotion({ className }: CheckCircleMotionProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <circle
        cx="36"
        cy="36"
        r="36"
        fill="#0095FF"
        className="transform-fill origin-center animate-check-circle-pop"
      />
      <path
        d="M19 35.5L28.5885 45.9602C29.3579 46.7996 30.6719 46.8281 31.477 46.023L52.5 25"
        pathLength="1"
        stroke="#CCEAFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="1 1"
        className="animate-check-circle-draw"
      />
    </svg>
  );
}

export default CheckCircleMotion;
