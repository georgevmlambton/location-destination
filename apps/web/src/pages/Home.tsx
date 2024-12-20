import { useContext } from 'react';
import receiptIcon from '../assets/receipt.svg';
import personFill from '../assets/person-fill.svg';
import findOfferRide from '../assets/find-offer-ride.svg';
import { UserContext } from '../providers/user-provider';
import { useNavigate } from 'react-router-dom';
import { NavButton } from '../components/nav/NavButton';

export default function Home() {
  const { profile } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="w-100 h-100 d-flex flex-column align-items-center">
      <div className="d-flex justify-content-between position-relative w-100 p-4">
        <NavButton icon={receiptIcon} onClick={() => navigate('/trips')} />
        <img
          className="rounded-circle"
          src={profile?.photoUrl || personFill}
          alt="Profile Avatar"
          style={{
            width: '42px',
            height: '42px',
            border: '2px solid #CCCCCC',
            background: 'white',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: 'rgba(0, 0, 0, 0.4) 0px 6px 16px',
          }}
          onClick={() => navigate('/profile')}
        />
      </div>

      <div className="p-4 pb-5 position-relative w-100"></div>
      <h3 className="text-dark-emphasis text-center mb-4">
        Welcome, {profile?.name}{' '}
      </h3>

      <div className="w-75 mt-4">
        {profile?.type === 'Rider' && (
          <div
            className="w-100 mb-3 position-relative"
            style={{
              backgroundImage: `url(${findOfferRide})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '150px',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/find-a-ride')}
          >
            <div
              className="position-absolute"
              style={{
                top: '25%',
                left: '10%',
                transform: 'translateY(-50%)',
                color: 'white',
                fontSize: '24px',
              }}
            >
              Find a Ride
            </div>
            <div
              className="position-absolute"
              style={{
                top: '75%',
                right: '10%',
                transform: 'translateY(-50%)',
              }}
            >
              <button
                className="btn btn-success"
                style={{
                  width: '60px',
                  height: '40px',
                  borderRadius: '20px',
                }}
              >
                &rarr;
              </button>
            </div>
          </div>
        )}

        {profile?.type === 'Driver' && (
          <div
            className="w-100 position-relative"
            style={{
              backgroundImage: `url(${findOfferRide})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '150px',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/offer-a-ride')}
          >
            <div
              className="position-absolute"
              style={{
                top: '25%',
                left: '10%',
                transform: 'translateY(-50%)',
                color: 'white',
                fontSize: '24px',
              }}
            >
              Offer a Ride
            </div>
            <div
              className="position-absolute"
              style={{
                top: '75%',
                right: '10%',
                transform: 'translateY(-50%)',
              }}
            >
              <button
                className="btn btn-success"
                style={{
                  width: '60px',
                  height: '40px',
                  borderRadius: '20px',
                }}
              >
                &rarr;
              </button>
            </div>
          </div>
        )}

        {profile?.type === 'Both' && (
          <>
            <div
              className="w-100 mb-3 position-relative"
              style={{
                backgroundImage: `url(${findOfferRide})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '150px',
                borderRadius: '15px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/find-a-ride')}
            >
              <div
                className="position-absolute"
                style={{
                  top: '25%',
                  left: '10%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  fontSize: '24px',
                }}
              >
                Find a Ride
              </div>
              <div
                className="position-absolute"
                style={{
                  top: '75%',
                  right: '10%',
                  transform: 'translateY(-50%)',
                }}
              >
                <button
                  className="btn btn-success"
                  style={{
                    width: '60px',
                    height: '40px',
                    borderRadius: '20px',
                  }}
                >
                  &rarr;
                </button>
              </div>
            </div>

            <div
              className="w-100 position-relative"
              style={{
                backgroundImage: `url(${findOfferRide})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '150px',
                borderRadius: '15px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/offer-a-ride')}
            >
              <div
                className="position-absolute"
                style={{
                  top: '25%',
                  left: '10%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  fontSize: '24px',
                }}
              >
                Offer a Ride
              </div>
              <div
                className="position-absolute"
                style={{
                  top: '75%',
                  right: '10%',
                  transform: 'translateY(-50%)',
                }}
              >
                <button
                  className="btn btn-success"
                  style={{
                    width: '60px',
                    height: '40px',
                    borderRadius: '20px',
                  }}
                >
                  &rarr;
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
