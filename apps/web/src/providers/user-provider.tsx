import { User } from 'firebase/auth';
import * as firebase from 'firebase/auth';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { auth } from '../firebase';
import { ToastContext } from './toast-provider';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  ProfilePatchRequest,
  ProfileResponse,
} from '@location-destination/types/src/requests/profile';
import { getInstance } from '../axios';
import { Button, Modal } from 'react-bootstrap';

type UserContextType = {
  user?: User;
  profile?: ProfileResponse;
  isProfileSetupDone: boolean;
  register: (email: string, password: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => void;
  sendVerifyEmail: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<void>;
  verifyPasswordResetCode: (code: string) => Promise<boolean>;
  updateProfile: (data: ProfilePatchRequest) => Promise<ProfileResponse>;
};

const initialUserContext: UserContextType = {
  isProfileSetupDone: false,

  register() {
    throw new Error('Missing provider');
  },
  signIn() {
    throw new Error('Missing provider');
  },
  signInWithGoogle() {
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
  updateProfile() {
    throw new Error('Missing provider');
  },
};

export const UserContext = createContext(initialUserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const toast = useContext(ToastContext);

  const [showSignOut, setShowSignOut] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [profile, setProfile] = useState<ProfileResponse | undefined>(
    undefined
  );
  const isProfileSetupDone = useMemo(
    () => !!profile?.name && !!profile.type,
    [profile]
  );

  const register = useCallback(async (email: string, password: string) => {
    const credential = await firebase.createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await firebase.sendEmailVerification(credential.user);
    return credential.user;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await firebase.signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return credential.user;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      return result.user;
    } catch (error) {
      toast.show('Google Sign-In failed', 'danger');
      throw error;
    }
  }, [toast]);
  

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

  async function updateProfile(data: Partial<ProfileResponse>) {
    const axios = await getInstance();
    const req: ProfilePatchRequest = {
      name: data.name,
      type: data.type,
    };

    const response = await axios.patch<ProfileResponse>('/api/profile', req);
    setProfile(response.data);
    return response.data;
  }

  useEffect(() => {
    const onUserChange = async (user: User | null) => {
      let profile: ProfileResponse | undefined;

      if (user) {
        try {
          const axios = await getInstance();
          const response = await axios.get<ProfileResponse>('/api/profile');
          profile = response.data;
        } catch (e) {
          toast.show(e.message, 'danger');
        }
      }

      setProfile(profile);
      setUser(user || undefined);
      setInitialized(true);
    };

    return auth.onAuthStateChanged(onUserChange);
  }, [toast]);

  useEffect(() => {}, [user, toast]);

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isProfileSetupDone,
        register,
        signIn,
        signInWithGoogle,
        signOut: () => setShowSignOut(true),
        sendVerifyEmail,
        verifyEmail,
        sendPasswordResetEmail,
        verifyPasswordResetCode,
        resetPassword,
        updateProfile,
      }}
    >
      {initialized && children}

      {showSignOut && (
        <Modal
          show
          onHide={() => setShowSignOut(false)}
          keyboard={false}
          style={{ marginTop: '62px' }}
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title>Sign Out</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to sign out?</Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              className="rounded-pill"
              variant="outline-dark"
              onClick={() => setShowSignOut(false)}
            >
              Close
            </Button>
            <Button
              className="rounded-pill"
              variant="danger"
              onClick={() => {
                signOut();
                setShowSignOut(false);
              }}
            >
              Sign Out
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </UserContext.Provider>
  );
}
