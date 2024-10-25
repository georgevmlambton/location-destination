import { useContext } from 'react';
import personFill from '../assets/person-fill.svg';
import findOfferRide from '../assets/find-offer-ride.svg';
import background from '../assets/background.png';
import { UserContext } from '../providers/user-provider';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { profile } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div
      className="w-100 h-100 d-flex flex-column align-items-center"
      style={{
        background:
          'linear-gradient(180deg, rgba(189,229,199,1) 0%, rgba(248,248,248,1) 30%, rgba(255,255,255,1) 100%)',
      }}
    >
      <img
        className="position-absolute"
        src={background}
        style={{
          height: 'auto',
          bottom: '-38%',
          left: '-49%',
          opacity: '24%',
          width: '160%',
        }}
      />
      <div className="p-4 align-self-stretch">
        <div className="d-flex justify-content-between position-relative">
        <img
            className="rounded-circle"
            src={profile?.photoUrl || personFill}
            alt="Profile Avatar"
            style={{
              width: '50px',
              height: '50px',
              border: '2px solid #CCCCCC',
              background: 'white',
              cursor: 'pointer',
              position: 'absolute',
              zIndex: 10,
              top: '10px',
              right: '10px',
            }}
            onClick={() => navigate('/profile')}
          />
        </div>
      </div>

      <div className="p-4 pb-5 position-relative w-100">
        
      </div>
      <h3 className="text-dark-emphasis text-center mb-4">Welcome, {profile?.name} </h3>

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
