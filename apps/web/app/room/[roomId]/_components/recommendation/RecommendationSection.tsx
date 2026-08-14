'use client';

import { useState } from 'react';
import { parseISO } from 'date-fns';

import AlertModal from '@/components/alert-modal';
import Header from '@/components/header';
import { ParticipantT } from '@/types/participant';
import {
  RecommendationCandidateDetailT,
  RecommendationTypeT,
} from '@/types/recommendation';

import DayDetailView from '../group-calendar/_components/DayDetailView';
import { useGetRoomScheduleCalendar } from '../group-calendar/_hooks/useGetRoomScheduleCalendar';
import { getDayAvailabilityStatus } from '../group-calendar/_utils/getDayAvailabilityStatus';
import { getDayDetailParticipants } from '../group-calendar/_utils/getDayDetailParticipants';
import {
  DEFAULT_DAY_SCHEDULE_VALUE,
  getMyDaySchedule,
} from '../group-calendar/_utils/getMyDaySchedule';
import { useGetRecommendationDetail } from './_hooks/useGetRecommendationDetail';
import { usePostConfirmTrip } from './_hooks/usePostConfirmTrip';
import { usePostRecommendations } from './_hooks/usePostRecommendations';
import { usePostUnconfirmTrip } from './_hooks/usePostUnconfirmTrip';
import RecommendationCancelStep from './steps/RecommendationCancelStep';
import RecommendationConfirmedStep from './steps/RecommendationConfirmedStep';
import RecommendationDetailStep from './steps/RecommendationDetailStep';
import RecommendationResultStep from './steps/RecommendationResultStep';
import RecommendationTypeStep from './steps/RecommendationTypeStep';

type RecommendationSectionProps = {
  roomId: string;
  roomName: string;
  inviteCode: string;
  myName: string;
  participants: ParticipantT[];
  tripStartDate: string;
  tripEndDate: string;
  isHost: boolean;
  onExit: () => void;
  respondedCount: number;
  onRequestResponse: () => void;
  isConfirmed: boolean;
  onConfirmed?: () => void;
  confirmedStartDate: string | null;
  confirmedEndDate: string | null;
  confirmedAttendCount: number | null;
  confirmedVacationMemberCount: number | null;
  confirmedUncertainCount: number | null;
};

function RecommendationSection({
  roomId,
  roomName,
  inviteCode,
  myName,
  participants,
  tripStartDate,
  tripEndDate,
  isHost,
  onExit,
  respondedCount,
  onRequestResponse,
  isConfirmed,
  onConfirmed,
  confirmedStartDate,
  confirmedEndDate,
  confirmedAttendCount,
  confirmedVacationMemberCount,
  confirmedUncertainCount,
}: RecommendationSectionProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<RecommendationTypeT | null>(null);
  const [candidates, setCandidates] = useState<
    RecommendationCandidateDetailT[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<RecommendationCandidateDetailT | null>(null);
  const [confirmedCandidate, setConfirmedCandidate] =
    useState<RecommendationCandidateDetailT | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [justUnconfirmed, setJustUnconfirmed] = useState(false);
  // 추천 근거 화면에서 날짜를 클릭했을 때 보여줄 그룹 달력 날짜 상세 — 이 컴포넌트
  // 자체의 로컬 상태로 둬서(RoomDetailSection의 section 전환을 타지 않음), 뒤로가기로
  // 닫아도 step/selectedCandidate 등 추천 화면 상태가 그대로 남아 원래 보던 추천
  // 상세로 돌아온다. isCancelOpen과 동일한 패턴.
  const [dateDetailDate, setDateDetailDate] = useState<Date | null>(null);
  const { roomScheduleCalendarData, refetchRoomScheduleCalendar } =
    useGetRoomScheduleCalendar(roomId);
  const { postRecommendationsMutation } = usePostRecommendations();
  const { getRecommendationDetailMutation } = useGetRecommendationDetail();
  const { postConfirmTripMutation } = usePostConfirmTrip();
  const { postUnconfirmTripMutation, isPostUnconfirmTripPending } =
    usePostUnconfirmTrip();

  const getDayStatus = (date: Date) =>
    roomScheduleCalendarData
      ? getDayAvailabilityStatus(roomScheduleCalendarData, date)
      : 'unavailable';

  const getDayParticipants = (date: Date) =>
    roomScheduleCalendarData
      ? getDayDetailParticipants(roomScheduleCalendarData, participants, date)
      : { needsAttention: [], available: [] };

  const getMyDayScheduleValue = (date: Date) =>
    roomScheduleCalendarData
      ? getMyDaySchedule(roomScheduleCalendarData, date)
      : DEFAULT_DAY_SCHEDULE_VALUE;

  if (dateDetailDate) {
    return (
      <DayDetailView
        selectedDate={dateDetailDate}
        onSelectDate={setDateDetailDate}
        onBack={() => setDateDetailDate(null)}
        minDate={parseISO(tripStartDate)}
        maxDate={parseISO(tripEndDate)}
        getDayStatus={getDayStatus}
        getDayParticipants={getDayParticipants}
        getMyDaySchedule={getMyDayScheduleValue}
        onScheduleUpdated={refetchRoomScheduleCalendar}
      />
    );
  }

  const handleUnconfirm = (
    reason: Parameters<typeof postUnconfirmTripMutation>[0]['reason'],
    reasonDetail?: string,
  ) => {
    postUnconfirmTripMutation(
      { roomId, reason, reasonDetail },
      {
        onSuccess: () => {
          setIsCancelOpen(false);
          setJustUnconfirmed(true);
          setStep(1);
          setType(null);
          setCandidates([]);
          setSelectedCandidate(null);
          setConfirmedCandidate(null);
          onConfirmed?.();
        },
        onError: () => setErrorMessage('일정을 취소하지 못했어요'),
      },
    );
  };

  if (isCancelOpen) {
    return (
      <>
        <RecommendationCancelStep
          onBack={() => setIsCancelOpen(false)}
          onSubmit={handleUnconfirm}
          isSubmitting={isPostUnconfirmTripPending}
        />
        <AlertModal
          open={errorMessage !== null}
          onOpenChange={(open) => !open && setErrorMessage(null)}
          variant="danger"
          title={errorMessage ?? ''}
          description="잠시 후 다시 시도해주세요"
          primaryText="확인"
          onPrimaryClick={() => setErrorMessage(null)}
        />
      </>
    );
  }

  if (isConfirmed && !justUnconfirmed) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header variant="page" title="추천 일정" onBack={onExit} />
        <div className="flex w-full flex-1 flex-col px-5">
          {confirmedStartDate && confirmedEndDate && (
            <RecommendationConfirmedStep
              roomId={roomId}
              roomName={roomName}
              inviteCode={inviteCode}
              startDate={confirmedStartDate}
              endDate={confirmedEndDate}
              attendCount={confirmedAttendCount ?? 0}
              leaveCount={confirmedVacationMemberCount ?? 0}
              uncertainCount={confirmedUncertainCount ?? 0}
              onCancel={() => setIsCancelOpen(true)}
              readOnly={!isHost}
            />
          )}
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (step === 1 || step === 4) {
      onExit();
      return;
    }
    if (step === 3) {
      setSelectedCandidate(null);
      setStep(2);
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleSelectCandidate = (candidate: RecommendationCandidateDetailT) => {
    getRecommendationDetailMutation(
      { roomId, rank: candidate.rank, myName },
      {
        onSuccess: (detail) => {
          setSelectedCandidate({ ...candidate, ...detail });
          setStep(3);
        },
        onError: () => setErrorMessage('추천 근거를 불러오지 못했어요'),
      },
    );
  };

  const handleConfirm = (candidate: RecommendationCandidateDetailT) => {
    getRecommendationDetailMutation(
      { roomId, rank: candidate.rank, myName },
      {
        onSuccess: (detail) => {
          const enrichedCandidate = { ...candidate, ...detail };
          postConfirmTripMutation(
            { roomId, recommendationRank: candidate.rank },
            {
              onSuccess: () => {
                onConfirmed?.();
                setJustUnconfirmed(false);
                setConfirmedCandidate(enrichedCandidate);
                setStep(4);
              },
              onError: () => setErrorMessage('일정을 확정하지 못했어요'),
            },
          );
        },
        onError: () => setErrorMessage('일정을 확정하지 못했어요'),
      },
    );
  };

  const handleGenerateRecommendations = () => {
    if (!type) return;
    postRecommendationsMutation(
      { roomId, type },
      {
        onSuccess: (data) => {
          setCandidates(data);
          setStep(2);
        },
        onError: () => setErrorMessage('추천 일정을 불러오지 못했어요'),
      },
    );
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="추천 일정" onBack={handleBack} />
      <div className="flex w-full flex-1 flex-col px-5">
        {step === 1 && (
          <RecommendationTypeStep
            value={type}
            onChange={setType}
            onNext={handleGenerateRecommendations}
            respondedCount={respondedCount}
            onRequestResponse={onRequestResponse}
          />
        )}
        {step === 2 && type && (
          <RecommendationResultStep
            type={type}
            candidates={candidates}
            onSelectCandidate={handleSelectCandidate}
            onConfirm={handleConfirm}
            onRetry={() => setStep(1)}
          />
        )}
        {step === 3 && selectedCandidate && (
          <RecommendationDetailStep
            roomId={roomId}
            roomName={roomName}
            candidate={selectedCandidate}
            onConfirm={handleConfirm}
            onFeedbackError={setErrorMessage}
            onSelectDate={setDateDetailDate}
          />
        )}
        {step === 4 && confirmedCandidate && (
          <RecommendationConfirmedStep
            roomId={roomId}
            roomName={roomName}
            inviteCode={inviteCode}
            startDate={confirmedCandidate.startDate}
            endDate={confirmedCandidate.endDate}
            attendCount={
              confirmedCandidate.attendCount ??
              confirmedCandidate.availableParticipants.length
            }
            leaveCount={confirmedCandidate.vacationMemberCount ?? 0}
            uncertainCount={confirmedCandidate.uncertainCount}
            onCancel={() => setIsCancelOpen(true)}
          />
        )}
      </div>

      <AlertModal
        open={errorMessage !== null}
        onOpenChange={(open) => !open && setErrorMessage(null)}
        variant="danger"
        title={errorMessage ?? ''}
        description="잠시 후 다시 시도해주세요"
        primaryText="확인"
        onPrimaryClick={() => setErrorMessage(null)}
      />
    </div>
  );
}

export default RecommendationSection;
