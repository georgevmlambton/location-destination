import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import { AuthenticatedRoute } from './components/AuthenticatedRoute';
import { UserProvider } from './providers/user-provider';
import { UnauthenticatedRoute } from './components/UnauthenticatedRoute';
import { Register } from './pages/Register';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthenticatedRoute element={<Home />} />,
  },
  {
    path: '/register',
    element: <UnauthenticatedRoute element={<Register />} />,
  },
]);

export default function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}
