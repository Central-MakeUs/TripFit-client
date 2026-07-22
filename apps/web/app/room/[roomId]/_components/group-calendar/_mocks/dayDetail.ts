import { ParticipantStatusT } from '../../../_common/_types/participantStatus';

// TODO: 실제 API 연동 전까지 사용하는 임시 데이터 — 클릭한 날짜와 무관하게 동일한 응답을 보여준다
export const MOCK_DAY_DETAIL: {
  needsAttention: ParticipantStatusT[];
  available: ParticipantStatusT[];
} = {
  needsAttention: [
    {
      name: '박효림',
      isHost: false,
      isMe: true,
      reason: { label: '불가능' },
      color: 'orange',
    },
    {
      name: '최정연',
      isHost: false,
      reason: { label: '부분 참여' },
      color: 'green',
    },
    {
      name: '하준수',
      isHost: false,
      reason: { label: '불확실 일정', days: 2 },
      color: 'purple',
    },
  ],
  available: [
    {
      name: '김민서',
      isHost: true,
      reason: { label: '정상 참석' },
      color: 'pink',
    },
  ],
};
