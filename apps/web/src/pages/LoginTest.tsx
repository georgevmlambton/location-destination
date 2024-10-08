import { FormEvent, useContext, useRef } from 'react';
import { UserContext } from '../providers/user-provider';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';

export default function LoginTest() {
  const { register: registerUser } = useContext(UserContext);
  const navigate = useNavigate();

  const formRef = useRef<HTMLFormElement>(null);

  async function register(e: FormEvent) {
    e.preventDefault();

    if (!formRef.current) {
      return;
    }

    const formData = new FormData(formRef.current);

    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return;
    }

    try {
      await registerUser(email.toString(), password.toString());
      navigate('/');
    } catch (e) {
      if (
        e instanceof FirebaseError &&
        e.code === 'auth/email-already-in-use'
      ) {
        console.error('Email Already in Use');
      } else {
        console.error(e);
      }
    }
  }

  return (
    <form onSubmit={register} ref={formRef}>
      <input placeholder="email" name="email" />
      <input placeholder="password" name="password" type="password" />
      <input type="submit" value="Register" />
    </form>
  );
}
