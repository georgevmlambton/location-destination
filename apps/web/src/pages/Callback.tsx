import { Navigate, useSearchParams } from 'react-router-dom';
import { ConfirmEmail } from './ConfirmEmail';
import { ResetPassword } from './ResetPassword';

export function Callback() {
  const [search] = useSearchParams();

  return search.get('mode') === 'verifyEmail' ? (
    <ConfirmEmail />
  ) : search.get('mode') === 'resetPassword' ? (
    <ResetPassword />
  ) : (
    <Navigate to="/sign-in" />
  );
}
