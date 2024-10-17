import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import envelopeIcon from '../assets/envelope-paper-fill.svg';
import * as yup from 'yup';
import { useContext, useState } from 'react';
import { UserContext } from '../providers/user-provider';
import { FirebaseError } from 'firebase/app';
import { ToastContext } from '../providers/toast-provider';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Must be a valid email')
    .required('Email is required'),
});

export function ForgotPassword() {
  const { sendPasswordResetEmail } = useContext(UserContext);
  const toast = useContext(ToastContext);

  const [sent, setSent] = useState(false);

  async function submit(email: string) {
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (e) {
      if (e instanceof FirebaseError && e.code === 'auth/user-not-found') {
        toast.show('A user with that email does not exist', 'danger');
      } else {
        toast.show(e.message, 'danger');
      }
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
      {sent && (
        <div className="text-center px-4">
          <img
            src={envelopeIcon}
            alt="Verify Email Icon"
            className="mb-4"
            style={{ width: '100px', height: '100px' }}
          />
          <h1 className="display-4 mb-5">Check Your Mail</h1>
          <p className="lead">
            An email has been sent to you. Please follow the instructions in
            that email to reset your password.
          </p>
          <Link
            to="/sign-in"
            className="btn btn-outline-dark rounded-pill w-100 py-2 mt-5 fs-4"
          >
            Back
          </Link>
        </div>
      )}
      {!sent && (
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
              initialValues={{ email: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                await submit(values.email);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="mt-4 text-start">
                  <p className="mb-5 text-center">
                    Enter your email address and we will send you a mail with
                    instructions to reset your password
                  </p>
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
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill w-100 py-2 mt-5 fs-4"
                    style={{ backgroundColor: '#00634B', border: 'none' }}
                    disabled={isSubmitting}
                  >
                    Send
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
            <Link to="/register" className="d-block mt-3 text-center">
              Don't have an account? Click here to register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
