import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext, useState } from 'react';
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
  password: yup.string().required('Password is required'),
});

export function SignIn() {
  const { signIn } = useContext(UserContext);
  const { signInWithGoogle } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const toast = useContext(ToastContext);

  async function submit(email: string, password: string) {
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (e) {
      if (e instanceof FirebaseError && e.code == 'auth/invalid-credential') {
        toast.show('Invalid Email/Password', 'danger');
      } else if (e instanceof Error) {
        toast.show(e.message, 'danger');
      }
      setLoading(false);
    }
  }

  // Function to handle Google Sign-In
  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
      toast.show('Google Sign-In successful!', 'success');
    } catch (e) {
      toast.show(`Google Sign-In failed: ${e.message}`, 'danger');
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
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => submit(values.email, values.password)}
          >
            {({ errors, touched }) => (
              <Form className="mt-4 text-start">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label ms-2 fs-5">
                    Email
                  </label>
                  <Field
                    type="email"
                    className={`form-control rounded-pill py-2 fs-5 ${
                      touched.email && errors.email ? 'border-danger' : 'border-secondary'
                    }`}
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
                    className={`form-control rounded-pill py-2 fs-5 ${
                      touched.password && errors.password ? 'border-danger' : 'border-secondary'
                    }`}
                    name="password"
                  />
                  <ErrorMessage
                    name="password"
                    className="text-danger ms-2"
                    component="p"
                  />
                </div>
                <Link to="/forgot-password" className="ms-2">
                  Forgot password
                </Link>
                <button
                  type="submit"
                  className="btn btn-success rounded-pill w-100 py-2 mt-5 fs-4"
                  style={{ backgroundColor: '#00634B', border: 'none' }}
                  disabled={loading}
                >
                  Sign In
                </button>
              </Form>
            )}
          </Formik>

          <button
            type="button"
            className="btn w-100 py-2 mt-3 fs-4"
            style={{
              backgroundColor: '#F5F5F5',
              color: '#000',
              border: '1px solid #DDDDDD',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0',
            }}
            onClick={handleGoogleSignIn}
          >
            <i
              className="fab fa-google me-2"
              style={{
                background: 'conic-gradient(from -45deg, #ea4335 110deg, #4285f4 90deg 180deg, #34a853 180deg 270deg, #fbbc05 270deg)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            ></i>  {/* Google Icon */}
            <span style={{ fontSize: '16px' }}>Log in with Google</span>
          </button>

          <Link to="/register" className="d-block mt-3 text-center">
            Don't have an account? Click here to register
          </Link>
          
        </div>
      </div>

      
    </div>
  );
}
