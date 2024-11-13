import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import arrowLeft from '../assets/arrow-left.svg';
import personFill from '../assets/person-fill.svg';
import { NavButton } from '../components/nav/NavButton';
import { UserContext } from '../providers/user-provider';
import { getInstance } from '../axios';
import { RideResponse } from '@location-destination/types/src/requests/ride';

export function TripHistory() {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const [trips, setTrips] = useState<RideResponse[]>([]);

  useEffect(() => {
    getInstance().then(async (axios) => {
      const response = await axios.get<RideResponse[]>('/api/rides');
      setTrips(response.data);
    });
  }, []);

  const handleTripClick = (trip: RideResponse) => {
    navigate('/ride/summary', { state: { ride: trip } });
  };

  return (
    <div className="d-flex flex-column align-items-stretch position-relative p-4 h-100 w-100">
      <div className="pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={() => navigate('/')} />
      </div>

      <h1 className="display-1 mb-5 text-center">
        <b>Past Trips</b>
      </h1>

      <div className="trip-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {trips.map((trip) => (
          <div
            key={trip.id}
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
            <div className="trip-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src = {user.profile?.userId !== trip.createdBy.uid
                  ? trip.createdBy?.photoUrl || personFill
                  : trip.driver?.photoUrl || personFill}
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
              ${user.profile?.userId !== trip.createdBy.uid
                ? (trip.payment && trip.payment.driver / 100) || 'Cancelled'
                : (trip.payment && trip.payment.total / 100) || 'Cancelled'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
