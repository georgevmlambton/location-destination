import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import { AuthenticatedRoute } from './components/AuthenticatedRoute';
import { UserProvider } from './providers/user-provider';
import { UnauthenticatedRoute } from './components/UnauthenticatedRoute';
import { Register } from './pages/Register';
import { ToastProvider } from './providers/toast-provider';
import { SignIn } from './pages/SignIn';
import VerifyEmail from './pages/VerifyEmail';
import { ConfirmEmail } from './pages/ConfirmEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthenticatedRoute element={<Home />} />,
  },
  {
    path: '/register',
    element: <UnauthenticatedRoute element={<Register />} />,
  },
  {
    path: '/sign-in',
    element: <UnauthenticatedRoute element={<SignIn />} />,
  },
  {
    path: '/verify-email',
    element: <AuthenticatedRoute element={<VerifyEmail />} />,
  },
  {
    path: '/verify-email/confirm',
    element: <ConfirmEmail />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
]);

export default function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ToastProvider>
  );
}
