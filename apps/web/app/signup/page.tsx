import { Suspense } from 'react';

import SignupFlow from './_components/SignupFlow';

function SignupPage() {
  return (
    <Suspense>
      <SignupFlow />
    </Suspense>
  );
}

export default SignupPage;
