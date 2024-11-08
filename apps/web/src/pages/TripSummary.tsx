import arrowLeft from '../assets/arrow-left.svg';
import personFill from '../assets/person-fill.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavButton } from '../components/nav/NavButton';
import { Field, Form, Formik } from 'formik';
import { RideResponse } from '@location-destination/types/src/requests/ride';
import { useContext } from 'react';
import { UserContext } from '../providers/user-provider';

export function TripSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useContext(UserContext);
  const ride: RideResponse = location.state.ride;

  return (
    <div className="d-flex flex-column align-items-stretch position-relative p-4 h-100 w-100">
      <div className="pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={() => navigate('/')} />
      </div>

      <h1 className="display-1 mb-5 text-center">
        <b>Trip Summary</b>
      </h1>
      <Formik
        initialValues={{
          pickup: ride.pickupAddress,
          dropoff: ride.dropoffAddress,
        }}
        onSubmit={(values) => {
          navigate('/find-a-ride', {
            state: { pickup: values.pickup, dropoff: values.dropoff },
          });
        }}
      >
        {() => (
          <Form className="d-flex flex-column">
            <div className="mb-4">
              <div className="position-relative mb-0">
                <span className="position-absolute top-50 translate-middle-y ms-3">
                  <i className="bi bi-geo-alt"></i>
                </span>
                <Field
                  disabled
                  type="text"
                  placeholder="Pickup Address"
                  className={`form-control py-2 ps-5 fs-5 border-secondary`}
                  name="pickup"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D1D1',
                    borderRadius: '10px 10px 0 0',
                    marginBottom: '-1px',
                  }}
                />
              </div>

              <div className="position-relative">
                <span className="position-absolute top-50 translate-middle-y ms-3">
                  <i className="bi bi-geo-alt-fill"></i>
                </span>
                <Field
                  disabled
                  type="text"
                  placeholder="Drop-off Address"
                  className={`form-control py-2 ps-5 fs-5 border-secondary`}
                  name="dropoff"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D1D1',
                    borderRadius: '0 0 10px 10px',
                  }}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>

      <div className="mt-5 d-flex flex-wrap align-items-stretch">
        <img
          className="rounded-circle"
          src={personFill}
          alt="Profile Avatar"
          style={{
            width: '100px',
            height: '100px',
            border: '2px solid #CCCCCC',
            background: 'white',
            cursor: 'pointer',
          }}
        />
        <div className="flex-grow-1 ps-3">
          <p className="my-2">You traveled with</p>
          <h1 className="">
            {user.profile?.type === 'Driver'
              ? ride.createdBy?.name
              : ride.driver?.name}
          </h1>
        </div>
      </div>
    </div>
  );
}
