import { useContext, useState } from 'react';
import envelopeIcon from '../assets/envelope-paper-fill.svg';
import { UserContext } from '../providers/user-provider';
import { ToastContext } from '../providers/toast-provider';
import { FirebaseError } from 'firebase/app';

const VerifyEmail = () => {
  const { sendVerifyEmail, signOut } = useContext(UserContext);
  const toast = useContext(ToastContext);

  const [sendingEmail, setSendingEmail] = useState(false);

  async function resend() {
    setSendingEmail(true);

    try {
      await sendVerifyEmail();
    } catch (e) {
      if (e instanceof FirebaseError && e.code === 'auth/too-many-requests') {
        toast.show('Too many requests. Try again after some time', 'danger');
      } else {
        toast.show(e.message, 'danger');
      }
    }

    setSendingEmail(false);
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center px-4">
        <img
          src={envelopeIcon}
          alt="Verify Email Icon"
          className="mb-4"
          style={{ width: '100px', height: '100px' }}
        />
        <h1 className="display-4 mb-5">Verify your Email</h1>
        <p className="lead">
          An email has been sent to you. Please follow the instructions in that
          email to verify your account.
        </p>
        <button
          onClick={resend}
          className="btn btn-success rounded-pill w-100 py-2 mt-5 fs-4"
          style={{ backgroundColor: '#00634B', border: 'none' }}
          disabled={sendingEmail}
        >
          Resend Email
        </button>
        <button
          onClick={signOut}
          className="btn btn-outline-dark rounded-pill w-100 py-2 mt-2 fs-4"
          disabled={sendingEmail}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
