import { ReactNode } from 'react';

import LogoIcon from '@/assets/icons/logo.svg';
import { cn } from '@/utils/cn';

const EFFECTIVE_DATE = '2026년 7월 27일';

const ENTRUSTED_COMPANIES = [
  { company: '카카오, Google, Apple', task: '소셜 로그인 인증' },
  { company: 'Google', task: 'Calendar API 일정 조회' },
  { company: 'Google, Apple', task: '푸시 알림 발송 (FCM/APNs)' },
  { company: 'Amazon Web Services (AWS)', task: '서버 및 데이터 저장' },
];

const OFFICER_INFO = [
  { label: '성명', value: '이윤지' },
  { label: '소속/직책', value: '진격의 여자들/PM' },
  { label: '이메일', value: 'tripfit.date@gmail.com' },
];

type PolicySectionProps = {
  number: number;
  title: string;
  children: ReactNode;
};

function PolicySection({ number, title, children }: PolicySectionProps) {
  return (
    <section className="flex w-full flex-col gap-2">
      <h2 className="flex text-body-03 text-grey-800">
        <span className="w-6 shrink-0">{number}.</span>
        <span>{title}</span>
      </h2>
      <div className="flex w-full flex-col gap-5 pl-6">{children}</div>
    </section>
  );
}

type PolicySubsectionProps = {
  title?: string;
  children: ReactNode;
};

function PolicySubsection({ title, children }: PolicySubsectionProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {title && <h3 className="text-body-05 text-grey-800">{title}</h3>}
      {children}
    </div>
  );
}

type PolicyBulletListProps = {
  items: ReactNode[];
  emphasized?: boolean;
};

function PolicyBulletList({
  items,
  emphasized = false,
}: PolicyBulletListProps) {
  return (
    <ul className="flex w-full flex-col gap-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="mt-2 size-[3px] shrink-0 rounded-full bg-grey-500" />
          <span
            className={cn(
              'text-caption-02 text-grey-500',
              emphasized && 'text-caption-01 text-grey-700',
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

type PolicyNoteBoxProps = {
  tone?: 'grey' | 'blue';
  children: ReactNode;
};

function PolicyNoteBox({ tone = 'grey', children }: PolicyNoteBoxProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 rounded-xl p-4 text-caption-02 text-grey-500',
        tone === 'blue' ? 'bg-blue-50' : 'bg-grey-50',
      )}
    >
      {children}
    </div>
  );
}

function PrivacyPolicyContent() {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col gap-1 border-b border-grey-50 px-5 pt-6 pb-3">
        <h1 className="text-headline-03 text-black">
          TripFit 개인정보 처리방침
        </h1>
        <p className="text-caption-02 text-grey-600">시행일 {EFFECTIVE_DATE}</p>
      </div>

      <div className="flex w-full flex-col items-end gap-5 px-5 pt-3 pb-6">
        <PolicyNoteBox tone="blue">
          <p>
            진격의 여자들(이하 &quot;운영팀&quot;)은 TripFit 서비스 제공을 위해
            필요한 최소한의 개인정보를 처리합니다.
          </p>
        </PolicyNoteBox>

        <div className="flex w-full flex-col gap-7">
          <PolicySection number={1} title="수집하는 정보">
            <PolicySubsection title="회원가입 및 로그인">
              <PolicyBulletList
                items={[
                  '카카오, Google, Apple 소셜 로그인 계정 식별자',
                  '소셜 로그인 계정의 이메일 주소',
                  '소셜 로그인 계정의 닉네임(프로필명)',
                  '소셜 로그인 계정의 프로필 이미지(URL)',
                  '이용자가 직접 입력한 이름',
                ]}
              />
              <PolicyNoteBox>
                <p>
                  Apple 로그인은 재로그인 시 이름·사진 정보가 안정적으로
                  제공되지 않아, 이메일과 식별자만 수집됩니다.
                </p>
                <p>
                  프로필 이미지는 자체 서버에 저장하지 않으며, 각 소셜 서비스가
                  제공하는 이미지 주소(URL)만 저장합니다.
                </p>
              </PolicyNoteBox>
            </PolicySubsection>

            <PolicySubsection title="일정 조율">
              <PolicyBulletList
                items={[
                  '여행방 생성 및 참여 정보',
                  '여행 기간 및 여행 일수',
                  '가능·불가능·불확실 일정',
                  '오전·오후·저녁별 일정 여부',
                  '반복 일정, 근무 일정 및 연차 정보',
                  '추천 일정 및 확정 일정',
                ]}
              />
            </PolicySubsection>

            <PolicySubsection title="Google 캘린더 연동 (선택)">
              <p className="text-caption-02 text-grey-500">
                Google 캘린더 연동 시 다음 정보를 조회하고 저장합니다.
              </p>
              <PolicyBulletList
                items={[
                  '날짜별 오전·오후·저녁 시간대의 일정 유무',
                  '연동 시점의 Google 계정 이메일 주소(내부 관리용, 외부 노출 없음)',
                  '캘린더 연동에 필요한 인증정보',
                ]}
              />
              <PolicyNoteBox>
                <p>
                  TripFit은 일정의 원본 시작·종료 시각, 제목, 설명, 장소, 참석자
                  등 상세 내용은 조회 요청 자체를 하지 않으며, 시간대별 일정
                  유무로 변환한 뒤 원본 시각 정보는 즉시 폐기합니다.
                </p>
                <p>
                  Google 캘린더 연동은 선택 사항이며, 연동하지 않아도 일정을
                  직접 입력할 수 있습니다.
                </p>
              </PolicyNoteBox>
            </PolicySubsection>

            <PolicySubsection title="푸시 알림">
              <PolicyBulletList items={['기기 푸시 토큰(FCM/APNs)']} />
              <PolicyNoteBox>
                <p>
                  푸시 토큰은 이용자에게 알림을 발송하기 위한 목적으로만
                  이용되며, 알림 수신은 기기 설정에서 언제든지 끌 수 있습니다.
                </p>
              </PolicyNoteBox>
            </PolicySubsection>
          </PolicySection>

          <PolicySection number={2} title="이용 목적">
            <p className="text-caption-02 text-grey-500">
              수집한 정보는 다음 목적으로만 이용합니다.
            </p>
            <PolicyBulletList
              items={[
                '회원가입, 로그인 및 계정 관리',
                '여행방 생성과 참여자 관리',
                '참여자 일정 비교',
                '여행 일정 추천 및 확정',
                'Google 캘린더 일정 불러오기',
                '푸시 알림 발송',
                '서비스 운영 및 오류 개선',
                '이용자 문의 처리',
              ]}
            />
          </PolicySection>

          <PolicySection number={3} title="보유 및 삭제">
            <div className="flex w-full flex-col gap-1 text-caption-02 text-grey-500">
              <p>
                회원 탈퇴 시에도 여행방의 조율 기록 보존을 위해 이름과 제출 일정
                등 일부 정보는 삭제되지 않고 남을 수 있습니다. 구체적인 기준은
                아래와 같습니다.
              </p>
              <p>
                회원 계정 정보, 이메일 주소, 푸시 토큰 및 Google 캘린더
                인증정보는 회원 탈퇴 시 삭제합니다.
              </p>
              <p>회원 탈퇴 시 여행방 정보는 다음과 같이 처리합니다.</p>
            </div>
            <PolicyNoteBox>
              <p className="text-caption-01 text-grey-700">
                회원 탈퇴 시 여행방 정보 처리 기준
              </p>
              <PolicyBulletList
                items={[
                  '조율 중인 여행: 참여가 취소되며 이름과 제출 일정이 삭제됩니다.',
                  '일정이 확정되었거나 만료된 여행: 기존 조율 기록을 유지하기 위해 이름과 제출 일정이 해당 여행방에 남을 수 있습니다.',
                ]}
              />
            </PolicyNoteBox>
            <p className="text-caption-02 text-grey-500">
              Google 캘린더를 통해 불러온 정보를 기반으로 제출된 일정 상태도 위
              기준에 따라 처리됩니다.
            </p>
          </PolicySection>

          <PolicySection number={4} title="개인정보 처리위탁">
            <p className="text-caption-02 text-grey-500">
              서비스 제공을 위해 아래와 같이 개인정보 처리업무를 위탁하고
              있습니다. 수탁업체는 위탁 목적 범위 내에서만 개인정보를
              처리합니다.
            </p>
            <div className="flex w-full flex-col overflow-hidden rounded-lg border border-grey-50">
              <div className="flex w-full border-b border-grey-50">
                <div className="flex-1 border-r border-grey-50 p-2">
                  <span className="text-caption-03 text-grey-700">
                    수탁업체
                  </span>
                </div>
                <div className="flex-1 p-2">
                  <span className="text-caption-03 text-grey-700">
                    위탁업무
                  </span>
                </div>
              </div>
              {ENTRUSTED_COMPANIES.map((row, index) => (
                <div
                  key={row.company}
                  className={cn(
                    'flex w-full',
                    index < ENTRUSTED_COMPANIES.length - 1 &&
                      'border-b border-grey-50',
                  )}
                >
                  <div className="flex-1 border-r border-grey-50 p-2">
                    <span className="text-caption-04 text-grey-500">
                      {row.company}
                    </span>
                  </div>
                  <div className="flex-1 p-2">
                    <span className="text-caption-04 text-grey-500">
                      {row.task}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PolicySection>

          <PolicySection number={5} title="제3자 제공">
            <p className="text-caption-02 text-grey-500">
              운영팀은 이용자의 개인정보를 판매하지 않으며, 이용자의 동의 또는
              법령상 근거 없이 제3자에게 제공하지 않습니다.
            </p>
          </PolicySection>

          <PolicySection number={6} title="Google 사용자 데이터">
            <p className="text-caption-02 text-grey-500">
              Google 사용자 데이터는 일정 입력과 여행 일정 추천 기능을 제공하기
              위한 목적으로만 이용합니다.
            </p>
            <PolicyBulletList
              items={[
                '일정 입력과 추천 기능 제공 목적으로만 이용합니다',
                '일정 제목과 상세 내용은 수집하지 않습니다',
                '광고·마케팅·판매 목적으로 이용하지 않습니다',
                '회원 탈퇴 시 캘린더 인증정보를 삭제합니다',
                'Google 계정 연결 관리 화면에서 접근 권한을 철회할 수 있습니다',
              ]}
            />
            <PolicyNoteBox>
              <p>
                TripFit의 Google 사용자 데이터 이용은 Google API Services User
                Data Policy의 Limited Use 요건을 준수합니다.
              </p>
            </PolicyNoteBox>
          </PolicySection>

          <PolicySection number={7} title="안전성 확보조치">
            <p className="text-caption-02 text-grey-500">
              운영팀은 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다.
            </p>
            <PolicyBulletList
              items={[
                '개인정보의 암호화 저장 및 전송',
                '개인정보 접근 권한의 최소화 및 관리',
              ]}
            />
          </PolicySection>

          <PolicySection number={8} title="이용자의 권리">
            <p className="text-caption-02 text-grey-500">
              이용자는 앱에서 자신의 정보를 수정하거나 회원 탈퇴를 할 수
              있습니다. Google 캘린더 접근 권한은 Google 계정 설정에서 철회할 수
              있으며, 개인정보 관련 문의 및 삭제 요청은 아래 이메일로 접수할 수
              있습니다.
            </p>
          </PolicySection>

          <PolicySection number={9} title="개인정보 보호책임자">
            <div className="flex w-full flex-col gap-2 rounded-xl bg-grey-50 p-4">
              {OFFICER_INFO.map((row) => (
                <div key={row.label} className="flex w-full gap-4">
                  <span className="w-14 shrink-0 text-caption-02 text-grey-500">
                    {row.label}
                  </span>
                  <span className="text-caption-01 text-grey-700">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-caption-02 text-grey-500">
              이용자는 TripFit 서비스를 이용하며 발생한 모든 개인정보 관련
              문의를 위 담당자에게 문의할 수 있습니다.
            </p>
          </PolicySection>

          <PolicySection number={10} title="개인정보 처리방침 변경">
            <p className="text-caption-02 text-grey-500">
              본 개인정보 처리방침은 서비스 또는 관련 법령의 변경에 따라 수정될
              수 있으며, 변경 시 앱 내 공지사항 또는 본 화면을 통해 고지합니다.
            </p>
            <PolicyBulletList
              emphasized
              items={[
                `시행일: ${EFFECTIVE_DATE}`,
                `최종 수정일: ${EFFECTIVE_DATE}`,
              ]}
            />
          </PolicySection>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 bg-grey-50 px-5 pt-6 pb-6">
        <LogoIcon className="h-6 w-20" />
        <div className="flex flex-col gap-0.5 text-caption-04 text-grey-300">
          <p>진격의 여자들 · TripFit</p>
          <p>시행일: {EFFECTIVE_DATE}</p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyContent;
