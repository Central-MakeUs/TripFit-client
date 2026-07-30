import { request } from '@/apis/request';
import {
  RecommendationFeedbackT,
  RecommendationParticipantT,
} from '@/types/recommendation';

type MemberAttendanceResponse = {
  name: string;
  attendance: 'FULL_ATTEND' | 'PARTIAL_ATTEND' | 'NON_ATTEND';
  uncertainDays: number;
  vacationDaysNeeded: number;
};

type RecommendationDetailResponse = {
  rank: number;
  members: MemberAttendanceResponse[];
  feedback: RecommendationFeedbackT | null;
};

export type GetRecommendationDetailResponseT = {
  availableParticipants: RecommendationParticipantT[];
  uncertainParticipants: RecommendationParticipantT[];
  feedback: RecommendationFeedbackT | null;
  attendCount: number;
  vacationMemberCount: number;
};

const PARTICIPANT_COLORS: RecommendationParticipantT['color'][] = [
  'pink',
  'orange',
  'green',
  'purple',
  'yellow',
];

// 이 응답엔 방장 여부가 없고 화면에서도 방장 표시는 필요 없어 항상 false로 둔다.
// userId가 없어 "나" 표시는 방 멤버 목록에서 이미 구한 내 표시명(myName)과 이름으로 대조
const toParticipant = (
  member: MemberAttendanceResponse,
  index: number,
  myName: string,
): RecommendationParticipantT => {
  const color = PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length] ?? 'pink';
  const isMe = member.name === myName;

  if (member.attendance === 'NON_ATTEND') {
    return {
      name: member.name,
      isHost: false,
      isMe,
      reason: { label: '불가능' },
      color,
    };
  }
  if (member.attendance === 'PARTIAL_ATTEND') {
    return {
      name: member.name,
      isHost: false,
      isMe,
      reason: { label: '부분 참여' },
      color,
    };
  }
  if (member.uncertainDays > 0) {
    return {
      name: member.name,
      isHost: false,
      isMe,
      reason: { label: '불확실 일정', days: member.uncertainDays },
      color,
    };
  }
  if (member.vacationDaysNeeded > 0) {
    return {
      name: member.name,
      isHost: false,
      isMe,
      reason: { label: '연차 필요', days: member.vacationDaysNeeded },
      color,
    };
  }
  return {
    name: member.name,
    isHost: false,
    isMe,
    reason: { label: '정상 참석' },
    color,
  };
};

export const getRecommendationDetail = async (
  roomId: string,
  rank: number,
  myName: string,
): Promise<GetRecommendationDetailResponseT> => {
  const response = await request<RecommendationDetailResponse>(
    `/api/v1/trips/${roomId}/recommendations/${rank}`,
  );

  const availableParticipants: RecommendationParticipantT[] = [];
  const uncertainParticipants: RecommendationParticipantT[] = [];

  response.members.forEach((member, index) => {
    const participant = toParticipant(member, index, myName);
    const needsAttention =
      member.attendance !== 'FULL_ATTEND' || member.uncertainDays > 0;

    if (needsAttention) {
      uncertainParticipants.push(participant);
    } else {
      availableParticipants.push(participant);
    }
  });

  // 확정 API의 confirmedAttendCount(전체+부분참석)와 정의를 맞춘다 — availableParticipants는
  // "주의가 필요한 인원" UI 분류 기준(불확실 일정 있으면 제외)이라 이 값과 다르다.
  const attendCount = response.members.filter(
    (member) => member.attendance !== 'NON_ATTEND',
  ).length;
  // confirmedVacationMemberCount는 연차가 필요한 "인원 수"인데, 후보 목록 API의 leaveCount는
  // 연차 "일수" 합계(totalVacationDays)라 단위가 달라 그대로 쓰면 안 된다.
  const vacationMemberCount = response.members.filter(
    (member) => member.vacationDaysNeeded > 0,
  ).length;

  return {
    availableParticipants,
    uncertainParticipants,
    feedback: response.feedback,
    attendCount,
    vacationMemberCount,
  };
};
