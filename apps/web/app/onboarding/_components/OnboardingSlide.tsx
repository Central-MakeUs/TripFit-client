import Image from 'next/image';

import LogoIcon from '@/assets/icons/logo.svg';
import Tag from '@/components/tag';

import { type OnboardingSlideT } from '../_consts/onboarding.const';

type OnboardingSlideProps = OnboardingSlideT & {
  priority?: boolean;
};

function OnboardingSlide({
  logo,
  badge,
  title,
  subtitle,
  image,
  priority = false,
}: OnboardingSlideProps) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center px-5">
      <div className="flex h-23 w-full min-w-0 flex-col items-center justify-end gap-2 text-center">
        {logo && <LogoIcon className="h-7 w-auto" />}
        {badge && (
          <Tag
            text={badge}
            className="h-7 text-caption-01 text-blue-500 rounded-md"
          />
        )}
        <h2 className="text-body-03 text-grey-800 whitespace-pre-line">
          {title}
        </h2>
        {subtitle && (
          <p className="text-caption-01 text-grey-400 whitespace-pre-line">
            {subtitle}
          </p>
        )}
      </div>
      <Image
        src={image}
        alt={title}
        draggable={false}
        className="mt-3 h-auto w-full select-none"
        priority={priority}
      />
    </div>
  );
}

export default OnboardingSlide;
