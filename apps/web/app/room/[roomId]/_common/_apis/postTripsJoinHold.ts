import { request } from '@/apis/request';

export type PostTripsJoinHoldRequestT = {
  inviteCode: string;
};

// 성공 시 방 미리보기 정보를 함께 내려주지만, 호출 시점(PreScheduleRequiredModal
// 확인 직후)엔 화면에 표시할 곳이 없어 필드를 소비하지 않는다 — 성공/409 여부만 판단.
export type PostTripsJoinHoldResponseT = unknown;

export const postTripsJoinHold = (requestBody: PostTripsJoinHoldRequestT) =>
  request<PostTripsJoinHoldResponseT>('/api/v1/trips/join/hold', {
    method: 'POST',
    data: requestBody,
  });
