import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import LoginTest from './pages/LoginTest';
import { AuthenticatedRoute } from './components/AuthenticatedRoute';
import { UserProvider } from './providers/user-provider';
import { UnauthenticatedRoute } from './components/UnauthenticatedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthenticatedRoute element={<Home />} />,
  },
  {
    path: '/login-test',
    element: <UnauthenticatedRoute element={<LoginTest />} />,
  },
]);

export default function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}
