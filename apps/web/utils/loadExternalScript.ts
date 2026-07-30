// 카카오/애플 로그인 SDK처럼 외부 <script>를 한 번만 불러오면 되는 경우 공용으로 쓰는 로더.
// src별로 캐시해서, 이미 로드됐거나 로드 중이면 같은 Promise를 그대로 재사용한다.
const loadPromises = new Map<string, Promise<void>>();

export const loadExternalScript = (
  src: string,
  isAlreadyLoaded: () => boolean,
  errorMessage: string,
): Promise<void> => {
  if (isAlreadyLoaded()) return Promise.resolve();

  const cached = loadPromises.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromises.delete(src);
      reject(new Error(errorMessage));
    };
    document.head.appendChild(script);
  });
  loadPromises.set(src, promise);
  return promise;
};
