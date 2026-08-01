import { ReactNode } from 'react';

type GuideStepProps = {
  description: string[];
  icon: ReactNode;
  title: string;
};

function GuideStep({ description, icon, title }: GuideStepProps) {
  return (
    <div className="flex w-full items-center gap-5">
      <div className="relative flex size-13 shrink-0 items-center justify-center rounded-full bg-blue-20">
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-body-05 text-grey-800">{title}</p>
        <div className="text-caption-04 text-grey-500">
          {description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuideStep;
