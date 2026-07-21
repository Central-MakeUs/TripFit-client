import ProgressBar from '@/components/progress-bar';

type ResponseRateCardProps = {
  respondedCount: number;
  capacity: number;
};

function ResponseRateCard({ respondedCount, capacity }: ResponseRateCardProps) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-[24px] bg-blue-50/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-body-05 text-grey-400">응답률</span>
        <span className="text-body-01 text-blue-700">
          {respondedCount}/{capacity}
        </span>
      </div>
      <ProgressBar
        value={(respondedCount / capacity) * 100}
        size="lg"
        trackColor="white"
      />
    </div>
  );
}

export default ResponseRateCard;
