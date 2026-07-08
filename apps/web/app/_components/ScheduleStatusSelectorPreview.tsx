'use client';

import { useState } from 'react';

import ScheduleStatusSelector from '@/components/schedule-status-selector';
import { ScheduleStatusOption } from '@/components/schedule-status-selector/scheduleStatusSelector.const';

function ScheduleStatusSelectorPreview() {
  const [value, setValue] = useState<ScheduleStatusOption>('unavailable');

  return <ScheduleStatusSelector value={value} onChange={setValue} />;
}

export default ScheduleStatusSelectorPreview;
