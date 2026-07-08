import ProgressBar from '@/components/progress-bar';

function ProgressBarPreview() {
  return (
    <div className="flex w-full flex-col gap-4">
      <ProgressBar value={30} size="sm" />
      <ProgressBar value={60} size="md" trackColor="white" />
      <ProgressBar value={90} size="lg" />
    </div>
  );
}

export default ProgressBarPreview;
