import Button from '@/components/button';
import RecommendationListItem from '@/components/recommendation-list-item';

export type RecommendationType =
  | 'default'
  | 'allAttend'
  | 'saveLeave'
  | 'certain';

const RECOMMENDATION_TYPE_LABEL: Record<RecommendationType, string> = {
  default: '기본 선택',
  allAttend: '모두 참석',
  saveLeave: '휴가 아끼기',
  certain: '확실하게 가기',
};

const RECOMMENDATION_TYPE_DESCRIPTION: Record<RecommendationType, string> = {
  default: '연차, 참석률, 불확정 일정을 골고루 반영해요',
  allAttend: '되도록 많은 사람이 함께할 수 있는 날짜를 찾아요',
  saveLeave: '연차를 최대한 적게 쓰는 날짜를 찾아요',
  certain: '불확실한 일정 말고 확정된 날짜 중에서 찾아요',
};

type RecommendationTypeStepProps = {
  value: RecommendationType | null;
  onChange: (value: RecommendationType) => void;
  onNext: () => void;
  respondedCount: number;
  onRequestResponse: () => void;
};

function RecommendationTypeStep({
  value,
  onChange,
  onNext,
  respondedCount,
  onRequestResponse,
}: RecommendationTypeStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-6 flex items-start gap-3">
        <h2 className="text-body-01 flex-1">
          {respondedCount}명의 응답을 기반으로 한
          <br />
          추천 일정이에요
        </h2>
        <Button
          text="응답 요청"
          size="M"
          style="outline"
          type="secondary"
          onClick={onRequestResponse}
        />
      </div>
      <div className="w-full" style={{ flexGrow: 52 }} />
      <div className="flex flex-col gap-2">
        {(Object.keys(RECOMMENDATION_TYPE_LABEL) as RecommendationType[]).map(
          (type) => (
            <RecommendationListItem
              key={type}
              title={RECOMMENDATION_TYPE_LABEL[type]}
              description={RECOMMENDATION_TYPE_DESCRIPTION[type]}
              active={value === type}
              onClick={() => onChange(type)}
            />
          ),
        )}
      </div>
      <div className="w-full" style={{ flexGrow: 137 }} />
      <div className="w-full pt-2 pb-0.5">
        <Button
          text="추천 일정 확인하기"
          type="primary"
          disabled={!value}
          onClick={onNext}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default RecommendationTypeStep;
