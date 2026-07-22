'use client';

import { useState } from 'react';

import CalendarConnectCompleteStep from './steps/CalendarConnectCompleteStep';
import CalendarConnectIntroStep from './steps/CalendarConnectIntroStep';

type CalendarConnectFlowProps = {
  onExit: () => void;
};

function CalendarConnectFlow({ onExit }: CalendarConnectFlowProps) {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    // TODO: 구글 캘린더 OAuth 연동 및 일정 동기화 API 연동
    setIsConnected(true);
  };

  if (isConnected) {
    return <CalendarConnectCompleteStep onConfirm={onExit} />;
  }

  return (
    <CalendarConnectIntroStep
      onBack={onExit}
      onConnect={handleConnect}
      onSkip={onExit}
    />
  );
}

export default CalendarConnectFlow;
