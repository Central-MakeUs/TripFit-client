import { request } from '@/apis/request';
import { RoomMemberStatusT, RoomStatusT } from '@/types/room';

export type PostTripsJoinRequestT = {
  inviteCode: string;
};

// 초대 링크를 쓴 직후, 일정 확인 화면에 들어가기 전에 호출한다 — 이 응답만으로는
// 아직 방 상세 API를 부를 수 없다(멤버는 SCHEDULE_PENDING으로 생성되고, 일정
// 확인을 마쳐야 activate로 ACTIVE가 된다). 방 이름·기간 등은 activate 이후
// GET /trips/{tripId}에서 얻는다.
export type PostTripsJoinResponseT = {
  tripId: string;
  status: RoomStatusT;
  myMemberStatus: RoomMemberStatusT;
};

export const postTripsJoin = (requestBody: PostTripsJoinRequestT) =>
  request<PostTripsJoinResponseT>('/api/v1/trips/join', {
    method: 'POST',
    data: requestBody,
  });
