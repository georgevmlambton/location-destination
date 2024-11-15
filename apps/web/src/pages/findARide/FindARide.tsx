import arrowLeft from '../../assets/arrow-left.svg';
import { NavButton } from '../../components/nav/NavButton';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import { ToastContext } from '../../providers/toast-provider';
import { FirebaseError } from 'firebase/app';
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { getInstance } from '../../axios';
import {
  RideCreateRequest,
  RideResponse,
} from '@location-destination/types/src/requests/ride';
import { AxiosError } from 'axios';
import { ProfileField } from '../profile/ProfileField';

const validationSchema = yup.object().shape({
  pickup: yup.string().required('Pickup is required'),
  dropoff: yup.string().required('Dropoff is required'),
});

export function FindARide() {
  const [loading, setLoading] = useState(false);
  const toast = useContext(ToastContext);
  const navigate = useNavigate();

  async function submit(pickup: string, dropoff: string, passengers: number) {
    try {
      setLoading(true);
      const req: RideCreateRequest = {
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        passengers,
      };
      const axios = await getInstance();
      const response = await axios.post<RideResponse>('/api/rides', req);
      console.log(response.data.id);

      navigate('/rideList', {
        state: { ride: response.data },
      });
    } catch (e) {
      if (e instanceof FirebaseError && e.code === 'auth/invalid-credential') {
        toast.show('Invalid Email/Password', 'danger');
      } else if (e instanceof AxiosError && e.response?.data?.message) {
        toast.show(e.response?.data?.message, 'danger');
      } else if (e instanceof Error) {
        toast.show(e.message, 'danger');
      }
      setLoading(false);
    }
  }

  return (
    <div className="d-flex flex-column align-items-center position-relative h-100 w-100">
      <div className="p-4 pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={() => navigate('/')} />
      </div>

      <h3 className="text-dark-emphasis text-center mb-4">
        Where are we traveling today?
      </h3>

      <div
        className="d-flex flex-column w-100 px-4"
        style={{
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
      >
        <Formik
          initialValues={{ pickup: '', dropoff: '', passengers: 1 }}
          validationSchema={validationSchema}
          onSubmit={(values) =>
            submit(values.pickup, values.dropoff, values.passengers)
          }
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="d-flex flex-column">
              <div className="mb-4">
                <div className="position-relative mb-0">
                  <span className="position-absolute top-50 translate-middle-y ms-3">
                    <i className="bi bi-geo-alt"></i>
                  </span>
                  <Field
                    type="text"
                    placeholder="Pickup Address"
                    className={`form-control py-2 ps-5 fs-5 ${
                      touched.pickup && errors.pickup
                        ? 'border-danger'
                        : 'border-secondary'
                    }`}
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
                    type="text"
                    placeholder="Drop-off Address"
                    className={`form-control py-2 ps-5 fs-5 ${
                      touched.dropoff && errors.dropoff
                        ? 'border-danger'
                        : 'border-secondary'
                    }`}
                    name="dropoff"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1D1D1',
                      borderRadius: '0 0 10px 10px',
                    }}
                  />
                </div>
              </div>

              <ErrorMessage
                name="pickup"
                className="text-danger ms-2"
                component="p"
              />
              <ErrorMessage
                name="dropoff"
                className="text-danger ms-2"
                component="p"
              />

              <ProfileField
                className="mt-4"
                errors={errors}
                touched={touched}
                label="Number of Passenger"
              >
                <div className="container">
                  <div className="row justify-content-start">
                    <button
                      type="button"
                      className="col col-auto btn text-white d-flex justify-content-center align-items-center p-0 pb-1"
                      style={{
                        backgroundColor: '#00634B',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        zIndex: 10,
                      }}
                      onClick={() =>
                        setFieldValue(
                          'passengers',
                          Math.max(1, values.passengers - 1)
                        )
                      }
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className={`col col-1 form-control w-auto text-center border-0 user-select-none`}
                      name={'passengers'}
                      readOnly
                      value={values.passengers}
                    />
                    <button
                      type="button"
                      className="col col-auto btn text-white d-flex justify-content-center align-items-center p-0 pb-1"
                      style={{
                        backgroundColor: '#00634B',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        zIndex: 10,
                      }}
                      onClick={() =>
                        setFieldValue('passengers', values.passengers + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </ProfileField>

              <div className="position-absolute bottom-0 start-0 w-100 p-4 pb-5">
                <button
                  type="submit"
                  className="btn btn-success rounded-pill w-100 py-2 fs-4"
                  style={{
                    backgroundColor: '#00634B',
                    border: 'none',
                    marginTop: '60%',
                    zIndex: 1,
                  }}
                  disabled={loading}
                >
                  Find a Ride
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
