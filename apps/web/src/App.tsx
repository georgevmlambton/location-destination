import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import { AuthenticatedRoute } from './components/AuthenticatedRoute';
import { UserProvider } from './providers/user-provider';
import { UnauthenticatedRoute } from './components/UnauthenticatedRoute';
import { Register } from './pages/Register';
import { ToastProvider } from './providers/toast-provider';
import { SignIn } from './pages/SignIn';
import VerifyEmail from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { Callback } from './pages/Callback';
import { Profile } from './pages/profile';
import { FindARide, RideList } from './pages/findARide';

import './App.css';
import { MainLayout } from './layout/MainLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthenticatedRoute element={<MainLayout />} />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: '/find-a-ride',
        element: <AuthenticatedRoute element={<FindARide />} />,
      },
      {
        path: '/rideList',
        element: <AuthenticatedRoute element={<RideList />} />,
      },
    ],
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
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/callback',
    element: <Callback />,
  },
  {
    path: '/profile',
    element: <AuthenticatedRoute element={<Profile />} />,
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
