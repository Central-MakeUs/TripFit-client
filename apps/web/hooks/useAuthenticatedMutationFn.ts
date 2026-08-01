import { useAuthStore } from '@/stores/authStore';

// 로그인 상태에서만 호출돼야 하는 mutationFn을 감싸, accessToken 없이 호출되면
// 실제 요청을 보내지 않고 동일한 메시지로 즉시 거부한다.
export const useAuthenticatedMutationFn = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return (variables: TVariables): Promise<TResult> => {
    if (!accessToken) {
      return Promise.reject(new Error('로그인이 필요합니다.'));
    }
    return mutationFn(variables);
  };
};
