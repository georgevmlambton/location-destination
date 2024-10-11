import { User } from 'firebase/auth';
import * as firebase from 'firebase/auth';
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
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  sendVerifyEmail: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<void>;
  verifyPasswordResetCode: (code: string) => Promise<boolean>;
};

const initialUserContext: UserContextType = {
  register() {
    throw new Error('Missing provider');
  },
  signIn() {
    throw new Error('Missing provider');
  },
  signOut() {
    throw new Error('Missing provider');
  },
  sendVerifyEmail() {
    throw new Error('Missing provider');
  },
  verifyEmail() {
    throw new Error('Missing provider');
  },
  sendPasswordResetEmail() {
    throw new Error('Missing provider');
  },
  verifyPasswordResetCode() {
    throw new Error('Missing provider');
  },
  resetPassword() {
    throw new Error('Missing provider');
  },
};

export const UserContext = createContext(initialUserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const toast = useContext(ToastContext);

  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  const register = useCallback(async (email: string, password: string) => {
    const credential = await firebase.createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await firebase.sendEmailVerification(credential.user);
    setUser(credential.user);
    return credential.user;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await firebase.signInWithEmailAndPassword(
      auth,
      email,
      password
    );
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

    await firebase.sendEmailVerification(user);

    toast.show('Verification email sent', 'success');
  }, [user, toast]);

  const verifyEmail = useCallback(
    async (code: string) => {
      await firebase.applyActionCode(auth, code);
      if (user) {
        await firebase.reload(user);
      }
    },
    [user]
  );

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    await firebase.sendPasswordResetEmail(auth, email);
  }, []);

  const verifyPasswordResetCode = useCallback(async (code: string) => {
    try {
      await firebase.verifyPasswordResetCode(auth, code);
      return true;
    } catch (_) {
      return false;
    }
  }, []);

  const resetPassword = useCallback(
    async (code: string, newPassword: string) => {
      await firebase.confirmPasswordReset(auth, code, newPassword);
    },
    []
  );

  useEffect(() => {
    const onUserChange = (user: User | null) => {
      setUser(user || undefined);
      setInitialized(true);
    };

    return auth.onAuthStateChanged(onUserChange);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        register,
        signIn,
        signOut,
        sendVerifyEmail,
        verifyEmail,
        sendPasswordResetEmail,
        verifyPasswordResetCode,
        resetPassword,
      }}
    >
      {initialized && children}
    </UserContext.Provider>
  );
}
