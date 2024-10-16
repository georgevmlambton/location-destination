import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { UserContext } from '../providers/user-provider';
import { FirebaseError } from 'firebase/app';
import { ToastContext } from '../providers/toast-provider';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Must be a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Must be at least 8 characters')
    .required('Password is required'),
  verifyPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm your password'),
});

export function Register() {
  const { register } = useContext(UserContext);
  const toast = useContext(ToastContext);

  async function submit(
    email: string,
    password: string,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true);
      await register(email, password);
    } catch (e) {
      if (
        e instanceof FirebaseError &&
        e.code === 'auth/email-already-in-use'
      ) {
        toast.show('Email Already in Use', 'danger');
      } else if (
        e instanceof FirebaseError &&
        e.code === 'auth/weak-password'
      ) {
        toast.show('Password is too weak', 'danger');
      } else if (e instanceof Error) {
        toast.show(e.message, 'danger');
      }

      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#FFFFF',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="row justify-content-center w-100 mx-3">
        <div className="col text-center">

          <div className="d-flex align-items-center justify-content-center mb-1">
            <img
                src="/public/logo.png"
                alt="EcoRide Logo"
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
          </div>
          <div className="d-flex align-items-center justify-content-center mb-5">
            <h1 className="ms-3">EcoRide</h1>
          </div>

          <Formik
            initialValues={{ email: '', password: '', verifyPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              setSubmitting(true);
              submit(values.email, values.password, setSubmitting);
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="mt-4 text-start">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label ms-2 fs-5">
                    Email
                  </label>
                  <Field
                    type="email"
                    className={`form-control rounded-pill py-2 fs-5 ${touched.email && errors.email ? 'border-danger' : 'border-secondary'}`}
                    name="email"
                  />
                  <ErrorMessage
                    name="email"
                    className="text-danger ms-2"
                    component="p"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label ms-2 fs-5">
                    Password
                  </label>
                  <Field
                    type="password"
                    className={`form-control rounded-pill py-2 fs-5 ${touched.password && errors.password ? 'border-danger' : 'border-secondary'}`}
                    name="password"
                  />
                  <ErrorMessage
                    name="password"
                    className="text-danger ms-2"
                    component="p"
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="verify-password"
                    className="form-label ms-2 fs-5"
                  >
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    className={`form-control rounded-pill py-2 fs-5 ${touched.verifyPassword && errors.verifyPassword ? 'border-danger' : 'border-secondary'}`}
                    name="verifyPassword"
                  />
                  <ErrorMessage
                    name="verifyPassword"
                    className="text-danger ms-2"
                    component="p"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success rounded-pill w-100 py-2 mt-5 fs-4"
                  style={{ backgroundColor: '#00634B', border: 'none' }}
                  disabled={isSubmitting}
                >
                  Register
                </button>
              </Form>
            )}
          </Formik>
          <Link to="/sign-in" className="d-block mt-3 text-center">
            Already have an account? Click here to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
