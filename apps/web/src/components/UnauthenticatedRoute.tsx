import { useContext } from 'react';
import { UserContext } from '../providers/user-provider';
import { Navigate } from 'react-router-dom';

export function UnauthenticatedRoute({ element }: { element: JSX.Element }) {
  const { user } = useContext(UserContext);

  return !user ? element : <Navigate to="/" />;
}