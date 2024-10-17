import { useContext } from 'react';
import { UserContext } from '../providers/user-provider';
import { Navigate, useLocation } from 'react-router-dom';

export function AuthenticatedRoute({ element }: { element: JSX.Element }) {
  const { user, isProfileSetupDone } = useContext(UserContext);
  const location = useLocation();

  return !user ? (
    <Navigate to="/sign-in" />
  ) : !user.emailVerified && location.pathname !== '/verify-email' ? (
    <Navigate to="/verify-email" />
  ) : !isProfileSetupDone && location.pathname !== '/profile' ? (
    <Navigate to="/profile" />
  ) : (
    element
  );
}
