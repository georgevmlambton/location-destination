import { useContext, useEffect } from 'react';
import { UserContext } from '../providers/user-provider';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getInstance } from '../axios';
import { RideResponse } from '@location-destination/types/src/requests/ride';

export function AuthenticatedRoute({ element }: { element: JSX.Element }) {
  const { user, isProfileSetupDone } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getInstance().then(async (axios) => {
      const response = await axios.get<RideResponse>('/api/rides/active', {
        validateStatus: () => true,
      });

      if (response.status !== 200) {
        return;
      }

      const ride = response.data;

      if (ride.state === 'Searching') {
        navigate('/rideList', { state: { ride } });
        return;
      }

      navigate('/ride', { state: { ride } });
    });
  }, [navigate, user?.uid]);

  return !user ? (
    <Navigate to="/sign-in" />
  ) : !user.emailVerified && location.pathname !== '/verify-email' ? (
    <Navigate to="/verify-email" />
  ) : user.emailVerified &&
    !isProfileSetupDone &&
    location.pathname !== '/profile' ? (
    <Navigate to="/profile" />
  ) : (
    element
  );
}
