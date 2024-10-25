import arrowLeft from '../../assets/arrow-left.svg';
import background from '../../assets/background.png';
import { NavButton } from '../../components/nav/NavButton';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import { ToastContext } from '../../providers/toast-provider';
import { FirebaseError } from 'firebase/app';
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';

const validationSchema = yup.object().shape({
  pickup: yup.string().required('Pickup is required'),
  dropoff: yup.string().required('Dropoff is required'),
});

export function FindARide() {
  const [loading, setLoading] = useState(false);
  const toast = useContext(ToastContext);
  const navigate = useNavigate();

  async function submit(pickup: string, dropoff: string) {
    try {
      setLoading(true);
      await FindARide();
    } catch (e) {
      if (e instanceof FirebaseError && e.code === 'auth/invalid-credential') {
        toast.show('Invalid Email/Password', 'danger');
      } else if (e instanceof Error) {
        toast.show(e.message, 'danger');
      }
      setLoading(false);
    }
  }

  return (
    <div
      className="d-flex flex-column align-items-center position-relative"
      style={{
        height: '100vh',
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
          initialValues={{ pickup: '', dropoff: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => submit(values.pickup, values.dropoff)}
        >
          {({ errors, touched, values }) => (
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
                      touched.pickup && errors.pickup ? 'border-danger' : 'border-secondary'
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
                      touched.dropoff && errors.dropoff ? 'border-danger' : 'border-secondary'
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

              <ErrorMessage name="pickup" className="text-danger ms-2" component="p" />
              <ErrorMessage name="dropoff" className="text-danger ms-2" component="p" />

              <button
                type="submit"
                className="btn btn-success rounded-pill w-100 py-2 fs-4"
                style={{ backgroundColor: '#00634B', border: 'none', marginTop: '60%', zIndex: 1 }}
                disabled={loading}
                onClick={() => navigate('/rideList', { state: { pickup: values.pickup, dropoff: values.dropoff } })}
              >
                Find a Ride
              </button>
            </Form>
          )}
        </Formik>

      </div>
    </div>
  );
}
