import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { ToastContext } from '../providers/toast-provider';
import { UserContext } from '../providers/user-provider';
import { FirebaseError } from 'firebase/app';

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, 'Must be at least 8 characters')
    .required('Password is required'),
  verifyPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm your password'),
});

export function ResetPassword() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, verifyPasswordResetCode } = useContext(UserContext);
  const toast = useContext(ToastContext);

  const [done, setDone] = useState(false);

  async function submit(newPassword: string) {
    const code = search.get('oobCode');

    if (!code) {
      navigate('/sign-in');
      return;
    }

    try {
      await resetPassword(code, newPassword);
      setDone(true);
    } catch (e) {
      if (e instanceof FirebaseError && e.code === 'auth/weak-password') {
        toast.show('Password is too weak', 'danger');
      } else {
        toast.show(e.message, 'danger');
      }
    }
  }

  useEffect(() => {
    const code = search.get('oobCode');

    if (!code) {
      toast.show('Invalid Link', 'danger');
      navigate('/sign-in');
      return;
    }

    verifyPasswordResetCode(code).then((valid) => {
      if (!valid) {
        toast.show('Invalid Link', 'danger');
        navigate('/sign-in');
      }
    });
  }, [navigate, search, toast, verifyPasswordResetCode]);

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
        {done && (
          <div className="text-center px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="100"
              fill="#00634B"
              className="bi bi-check2"
              viewBox="0 0 16 16"
            >
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
            </svg>
            <h1 className="display-5 mb-5">Password updated</h1>
            <Link
              to="/sign-in"
              className="btn btn-success rounded-pill w-100 py-2 mt-5 fs-4"
              style={{ backgroundColor: '#00634B' }}
            >
              Sign In
            </Link>
          </div>
        )}
        {!done && (
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
              initialValues={{ password: '', verifyPassword: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                await submit(values.password);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="mt-4 text-start">
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label ms-2 fs-5">
                      New Password
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
                    Continue
                  </button>
                  <Link
                    to="/sign-in"
                    className="btn btn-outline-dark rounded-pill w-100 py-2 mt-2 fs-4"
                  >
                    Cancel
                  </Link>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
}
