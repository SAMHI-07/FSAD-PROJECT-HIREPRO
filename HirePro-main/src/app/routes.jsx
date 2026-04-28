import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import ProfessionalProfile from './pages/ProfessionalProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManageData from './pages/ManageData';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'professional/:id',
        element: <ProfessionalProfile />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manage-data',
        element: (
          <ProtectedRoute>
            <ManageData />
          </ProtectedRoute>
        ),
      },
      {
        path: 'become-professional',
        element: <Register />,
      },
      {
        path: '*',
        element: (
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-semibold mb-4">Page Not Found</h1>
            <p className="text-gray-600">The page you're looking for doesn't exist.</p>
          </div>
        ),
      },
    ],
  },
]);
