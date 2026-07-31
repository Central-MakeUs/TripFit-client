import Header from '@/components/header';

import PrivacyPolicyContent from './_components/PrivacyPolicyContent';

function PrivacyPolicyPage() {
  return (
    <div className="flex w-full flex-1 flex-col bg-white">
      <Header variant="page" title="개인정보 처리방침" />
      <PrivacyPolicyContent />
    </div>
  );
}

export default PrivacyPolicyPage;
