import { useQuery } from '@tanstack/react-query';

import { getVacationPolicy } from '@/apis/vacationPolicy';

export const VACATION_POLICY_QUERY_KEY = ['vacation-policy'];

export const useGetVacationPolicy = (options?: { enabled?: boolean }) => {
  const {
    data: vacationPolicyData,
    isLoading: isVacationPolicyLoading,
    refetch: refetchVacationPolicy,
  } = useQuery({
    queryKey: VACATION_POLICY_QUERY_KEY,
    queryFn: getVacationPolicy,
    enabled: options?.enabled,
  });

  return {
    vacationPolicyData,
    isVacationPolicyLoading,
    refetchVacationPolicy,
  };
};
