import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { auth } from '../firebase';

type UserContextType = {
  user?: User;
  register: (email: string, password: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
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
};

export const UserContext = createContext(initialUserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined);

  const register = useCallback(async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    setUser(credential.user);
    return credential.user;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    setUser(credential.user);
    return credential.user;
  }, []);

  const signOut = useCallback(async () => {
    return auth.signOut();
  }, []);

  useEffect(() => {
    const onUserChange = (user: User | null) => {
      setUser(user || undefined);
    };

    onUserChange(auth.currentUser);

    return auth.onAuthStateChanged(onUserChange);
  }, []);

  return (
    <UserContext.Provider value={{ user, register, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}
