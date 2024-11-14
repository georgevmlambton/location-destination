import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import arrowLeft from '../assets/arrow-left.svg';
import personFill from '../assets/person-fill.svg';
import { NavButton } from '../components/nav/NavButton';
import { UserContext } from '../providers/user-provider';
import { getInstance } from '../axios';
import { RideResponse } from '@location-destination/types/src/requests/ride';
import { AccountResponse } from '@location-destination/types/src/requests/account';
import { MakePaymentResponse } from '@location-destination/types/src/requests/transaction';

export function TripHistory() {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const [trips, setTrips] = useState<RideResponse[]>([]);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getInstance().then(async (axios) => {
      const [rideResponse, accountResponse] = await Promise.all([
        axios.get<RideResponse[]>('/api/rides'),
        axios.get<AccountResponse>('/api/account'),
      ]);
      setTrips(rideResponse.data);
      setAccount(accountResponse.data);
    });
  }, []);

  const makePayment = async () => {
    setLoading(true);
    const axios = await getInstance();
    const response = await axios.post<MakePaymentResponse>('/api/account/pay');
    const redirectUrl = response.data.redirectUrl;
    window.location.assign(redirectUrl);
  };

  const handleTripClick = (trip: RideResponse) => {
    navigate('/ride/summary', { state: { ride: trip, back: '/trips' } });
  };

  return (
    <div className="d-flex flex-column align-items-stretch position-relative p-4 h-100 w-100">
      <div className="pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={() => navigate('/')} />
      </div>

      <div className="d-flex align-items-center">
        <h1 className="display-4">
          <b>Your balance</b>
        </h1>
        <h1
          className={
            'flex-grow-1 text-end display-4' +
            ((account?.amount ?? 0) < 0 ? ' text-danger' : '')
          }
        >
          <b>
            {(account?.amount ?? 0) < 0 ? '-' : ''}$
            {Math.abs((account?.amount ?? 0) / 100)}
          </b>
        </h1>
      </div>
      <Link to="/transactions">See transaction history</Link>

      {(account?.amount ?? 0) < 0 && (
        <button
          className="btn btn-primary rounded-pill py-2 fs-4 mx-4 mt-4"
          onClick={makePayment}
          disabled={loading}
        >
          Pay
        </button>
      )}

      <h1 className="display-6 mt-5 mb-3">
        <b>Past Trips</b>
      </h1>

      <div
        className="trip-list"
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {trips.length === 0 && <p className="text-center">No trips yet</p>}
        {trips.map((trip) => (
          <div
            key={trip.id}
            role="button"
            className="trip-item"
            onClick={() => handleTripClick(trip)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              backgroundColor: '#f9f9f9',
            }}
          >
            <div
              className="trip-info"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <img
                src={
                  user.profile?.type === 'Driver'
                    ? trip.createdBy?.photoUrl || personFill
                    : trip.driver?.photoUrl || personFill
                }
                alt="Profile Icon"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid #CCCCCC',
                }}
              />
              <div>
                <div>{trip.pickupAddress}</div>
                <div>{trip.dropoffAddress}</div>
              </div>
            </div>
            <div className="trip-fare" style={{ fontWeight: 'bold' }}>
              $
              {user.profile?.type === 'Driver'
                ? (trip.payment && trip.payment.driver / 100) || 'Cancelled'
                : (trip.payment && trip.payment.total / 100) || 'Cancelled'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
