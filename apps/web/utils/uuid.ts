// crypto.randomUUID()는 보안 컨텍스트(https 또는 localhost)에서만 존재한다 — LAN IP로
// 접속하는 실기기 로컬 테스트 등 비보안 컨텍스트에서는 함수 자체가 없어 즉시 에러가 난다.
// crypto.getRandomValues는 보안 컨텍스트 제약이 없어 이를 이용해 UUID v4로 폴백한다.
export const randomUUID = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
