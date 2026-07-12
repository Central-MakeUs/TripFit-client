import { cn } from '@/utils/cn';

import {
  profileColorStyle,
  profileDisabledStyle,
  profileStyle,
} from './profile.style';

type ProfileProps = {
  className?: string;
  color?: 'purple' | 'pink' | 'orange' | 'yellow' | 'green';
  disabled?: boolean;
  size?: 'S' | 'M';
  text: string;
  tone?: 1 | 2;
};

function Profile({
  className,
  color = 'purple',
  disabled = false,
  size = 'S',
  text,
  tone = 1,
}: ProfileProps) {
  return (
    <div
      className={cn(
        profileStyle({ size }),
        disabled ? profileDisabledStyle : profileColorStyle[color]?.[tone],
        className,
      )}
    >
      <span>{text}</span>
    </div>
  );
}

export default Profile;
