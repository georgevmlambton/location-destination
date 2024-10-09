import {
  createUserWithEmailAndPassword,
  User,
  sendEmailVerification,
} from 'firebase/auth';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth } from '../firebase';
import { ToastContext } from './toast-provider';

type UserContextType = {
  user?: User;
  register: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  sendVerifyEmail: () => Promise<void>;
};

const initialUserContext: UserContextType = {
  register() {
    throw new Error('Missing provider');
  },
  signOut() {
    throw new Error('Missing provider');
  },
  sendVerifyEmail() {
    throw new Error('Missing provider');
  },
};

export const UserContext = createContext(initialUserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const toast = useContext(ToastContext);

  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  const register = useCallback(async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(credential.user);
    setUser(credential.user);
    return credential.user;
  }, []);

  const signOut = useCallback(async () => {
    return auth.signOut();
  }, []);

  const sendVerifyEmail = useCallback(async () => {
    if (!user) {
      throw new Error('Not logged in');
    }

    await sendEmailVerification(user);

    toast.show('Verification email sent', 'success');
  }, [user, toast]);

  useEffect(() => {
    const onUserChange = (user: User | null) => {
      setUser(user || undefined);
      setInitialized(true);
    };

    return auth.onAuthStateChanged(onUserChange);
  }, []);

  return (
    <UserContext.Provider value={{ user, register, signOut, sendVerifyEmail }}>
      {initialized && children}
    </UserContext.Provider>
  );
}
