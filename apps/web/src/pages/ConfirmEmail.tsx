import envelopeIcon from '../assets/envelope-paper-fill.svg';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContext, useEffect, useRef } from 'react';
import { ToastContext } from '../providers/toast-provider';
import { FirebaseError } from 'firebase/app';
import { UserContext } from '../providers/user-provider';

export function ConfirmEmail() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const { verifyEmail } = useContext(UserContext);

  const verifyingRef = useRef(false);

  useEffect(() => {
    const code = search.get('oobCode');

    if (!code) {
      navigate('/sign-in');
      return;
    }

    if (verifyingRef.current) {
      return;
    }

    verifyingRef.current = true;

    verifyEmail(code)
      .then(async () => {
        toast.show('Email verified', 'success');
        navigate('/');
      })
      .catch((e) => {
        if (
          e instanceof FirebaseError &&
          e.code === 'auth/invalid-action-code'
        ) {
          toast.show('Invalid link', 'danger');
        } else if (
          e instanceof FirebaseError &&
          e.code === 'auth/expired-action-code'
        ) {
          toast.show('Link expired', 'danger');
        } else {
          toast.show(e.message, 'danger');
        }

        navigate('/sign-in');
      });
  }, [search, navigate, toast, verifyEmail]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center px-4">
        <img
          src={envelopeIcon}
          alt="Verify Email Icon"
          className="mb-4"
          style={{ width: '100px', height: '100px' }}
        />
        <h1 className="display-4 mb-5">Verifying your email</h1>
        <p className="lead">
          Give us a few seconds. You will be redirected shortly.
        </p>
      </div>
    </div>
  );
}
