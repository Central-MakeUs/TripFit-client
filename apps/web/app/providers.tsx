'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ApiError } from '@/apis/request';

type QueryProviderProps = {
  children: ReactNode;
};

// 재시도해도 결과가 달라지지 않는(다시 시도해도 동일하게 거부되는) 것으로 확인된 코드만 명시
const NON_RETRYABLE_ERROR_CODES = [
  'SCHEDULE_CONFIRM_REQUIRED',
  'SCHEDULE_ENTRY_REQUIRED',
];

const isNonRetryableError = (error: unknown) =>
  error instanceof ApiError &&
  !!error.code &&
  NON_RETRYABLE_ERROR_CODES.includes(error.code);

function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) =>
              !isNonRetryableError(error) && failureCount < 3,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
