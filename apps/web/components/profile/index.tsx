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
  size?: 'S' | 'M' | 'L';
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
      {/* disabled는 "+N" 초과 배지 용도라 이름이 아니므로 자르지 않는다 */}
      <span>{disabled ? text : text.slice(0, 2)}</span>
    </div>
  );
}

export default Profile;
