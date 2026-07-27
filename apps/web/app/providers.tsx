'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ApiError } from '@/apis/request';

type QueryProviderProps = {
  children: ReactNode;
};

const isClientError = (error: unknown) =>
  error instanceof ApiError &&
  error.status !== undefined &&
  error.status >= 400 &&
  error.status < 500;

function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) =>
              !isClientError(error) && failureCount < 3,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
