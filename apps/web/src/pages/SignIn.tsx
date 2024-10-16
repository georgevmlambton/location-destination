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
          <div className="d-flex align-items-center justify-content-center mb-5">
            <div
              className="bg-secondary rounded-circle"
              style={{ width: '60px', height: '60px' }}
            ></div>
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
          <Link to="/register" className="d-block mt-3 text-center">
            Don't have an account? Click here to register
          </Link>
        </div>
      </div>
    </div>
  );
}
