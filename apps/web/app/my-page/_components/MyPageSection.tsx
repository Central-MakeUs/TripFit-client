'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ModifyIcon from '@/assets/icons/modify.svg';
import AlertModal from '@/components/alert-modal';
import Header from '@/components/header';
import Profile from '@/components/profile';
import Toggle from '@/components/toggle';
import { usePatchMyPageProfile } from '@/hooks/usePatchMyPageProfile';
import { usePostDeviceToken } from '@/hooks/usePostDeviceToken';
import {
  clearAuthGuardRedirectSuppression,
  suppressNextAuthGuardRedirectOnce,
  useAuthStore,
} from '@/stores/authStore';
import { requestNativePushToken } from '@/utils/nativeBridge';
import { isReactNativeWebView } from '@/utils/platform';

import { useDeleteDeviceToken } from '../_hooks/useDeleteDeviceToken';
import { useDeleteUser } from '../_hooks/useDeleteUser';
import { usePostLogout } from '../_hooks/usePostLogout';
import ProfileEditNameView from './ProfileEditNameView';
import WithdrawConfirmView from './WithdrawConfirmView';

type ModeT = 'view' | 'editName' | 'withdraw';

function MyPageSection() {
  const router = useRouter();
  const [mode, setMode] = useState<ModeT>('view');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const email = useAuthStore((state) => state.email);
  const firstName = useAuthStore((state) => state.firstName);
  const lastName = useAuthStore((state) => state.lastName);
  const pushDeviceToken = useAuthStore((state) => state.pushDeviceToken);
  const setPushDeviceToken = useAuthStore((state) => state.setPushDeviceToken);
  const [notificationEnabled, setNotificationEnabled] = useState(
    useAuthStore.getState().notificationEnabled,
  );
  const [isRequestingPushToken, setIsRequestingPushToken] = useState(false);

  const { patchMyPageProfileMutation } = usePatchMyPageProfile();
  const { postDeviceTokenMutation } = usePostDeviceToken();
  const { deleteDeviceTokenMutation } = useDeleteDeviceToken();
  const { deleteUserMutation } = useDeleteUser();
  const { postLogoutMutation } = usePostLogout();

  const handleSaveName = ({
    lastName,
    firstName,
  }: {
    lastName: string;
    firstName: string;
  }) => {
    patchMyPageProfileMutation(
      { lastName, firstName },
      {
        onSuccess: () => setMode('view'),
        onError: (error) => setErrorMessage(error.message),
      },
    );
  };

  // 토글은 OS 알림 권한 자체를 켜고 끄지 않는다(기기 설정에서 거부한 건 앱이 되돌릴 수
  // 없음) — 대신 이 기기의 FCM 토큰을 서버에 등록/해제해 실제 수신 여부를 제어한다.
  const handleToggleNotification = (checked: boolean) => {
    if (!checked) {
      setNotificationEnabled(false);
      patchMyPageProfileMutation({ notificationEnabled: false });
      if (pushDeviceToken) {
        deleteDeviceTokenMutation(pushDeviceToken, {
          onSuccess: () => setPushDeviceToken(null),
        });
      }
      return;
    }

    if (!isReactNativeWebView()) {
      setNotificationEnabled(true);
      patchMyPageProfileMutation({ notificationEnabled: true });
      return;
    }

    setIsRequestingPushToken(true);
    requestNativePushToken()
      .then(({ token, deviceType }) => {
        postDeviceTokenMutation(
          { token, deviceType },
          {
            onSuccess: () => {
              setPushDeviceToken(token);
              setNotificationEnabled(true);
              patchMyPageProfileMutation({ notificationEnabled: true });
            },
            onError: () =>
              setErrorMessage(
                '알림 등록에 실패했어요. 잠시 후 다시 시도해주세요.',
              ),
          },
        );
      })
      .catch(() =>
        setErrorMessage(
          '알림 권한이 필요해요. 기기 설정에서 알림을 허용해주세요.',
        ),
      )
      .finally(() => setIsRequestingPushToken(false));
  };

  const handleWithdraw = () => {
    // clear()로 accessToken이 지워지는 시점과 아래 router.push가 실제로 반영되는
    // 시점 사이의 찰나에 AuthGuard가 먼저 반응해 "방금 있던 페이지로 돌아오라"는
    // 리다이렉트를 만들어버릴 수 있어, 그걸 이번 한 번은 건너뛰라고 미리 표시해둔다.
    suppressNextAuthGuardRedirectOnce();
    deleteUserMutation(undefined, {
      onSuccess: () => router.push('/signup'),
      // 요청 자체가 실패하면 accessToken이 안 지워져 AuthGuard가 이번엔
      // 반응하지 않으므로, 켜둔 억제 플래그가 다음(무관한) 차단 때 잘못
      // 소비되지 않도록 꺼둔다.
      onError: (error) => {
        clearAuthGuardRedirectSuppression();
        setErrorMessage(error.message);
      },
    });
  };

  const handleLogout = () => {
    suppressNextAuthGuardRedirectOnce();
    postLogoutMutation(undefined, {
      onSuccess: () => router.push('/signup'),
      onError: (error) => {
        clearAuthGuardRedirectSuppression();
        setErrorMessage(error.message);
      },
    });
  };

  if (mode === 'editName') {
    return (
      <ProfileEditNameView
        initialLastName={lastName ?? ''}
        initialFirstName={firstName ?? ''}
        onBack={() => setMode('view')}
        onSave={handleSaveName}
      />
    );
  }

  if (mode === 'withdraw') {
    return (
      <WithdrawConfirmView
        onBack={() => setMode('view')}
        onWithdraw={handleWithdraw}
      />
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-grey-20">
      <Header variant="page" title="마이페이지" background="grey-20" />
      <div className="flex w-full flex-1 flex-col items-center justify-between px-5 pt-3 pb-1">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full flex-col items-center gap-4 rounded-2xl border-b border-grey-50 bg-white px-3 pt-5 pb-3">
            <div className="flex w-full items-center gap-4">
              <Profile size="L" text={firstName ?? ''} color="purple" />
              <div className="flex flex-col">
                <span className="text-body-03 text-black">
                  {lastName}
                  {firstName}
                </span>
                <span className="text-body-06 text-grey-500">{email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode('editName')}
              className="flex h-9 w-full cursor-pointer items-center justify-center gap-0.5 rounded-xl bg-grey-50 pl-3 pr-2"
            >
              <span className="text-caption-01 text-grey-600">수정하기</span>
              <ModifyIcon className="size-4 text-grey-600" />
            </button>
          </div>

          <div className="flex w-full items-center gap-1 rounded-2xl border-b border-grey-50 bg-white p-4">
            <span className="flex-1 text-body-05 text-grey-800">알림 허용</span>
            <Toggle
              checked={notificationEnabled}
              onCheckedChange={handleToggleNotification}
              disabled={isRequestingPushToken}
              aria-label="알림 허용"
            />
          </div>

          <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center border-b border-grey-50 p-4"
            >
              <span className="text-body-05 text-grey-800">로그아웃</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('withdraw')}
              className="flex w-full cursor-pointer items-center p-4"
            >
              <span className="text-body-05 text-grey-800">탈퇴하기</span>
            </button>
          </div>
        </div>

        <Link
          href="/privacy-policy"
          className="flex cursor-pointer items-center gap-1 rounded-xl p-2"
        >
          <span className="text-caption-01 text-grey-400 underline underline-offset-2">
            개인정보 처리방침
          </span>
        </Link>
      </div>

      <AlertModal
        open={errorMessage !== null}
        onOpenChange={(open) => !open && setErrorMessage(null)}
        variant="danger"
        title="문제가 발생했어요"
        description={errorMessage ?? ''}
        primaryText="확인"
        onPrimaryClick={() => setErrorMessage(null)}
      />
    </div>
  );
}

export default MyPageSection;
