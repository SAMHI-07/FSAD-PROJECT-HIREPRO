import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import UserDashboard from '../components/dashboards/UserDashboard';
import ProfessionalDashboard from '../components/dashboards/ProfessionalDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import SupportDashboard from '../components/dashboards/SupportDashboard';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  switch (user?.role) {
    case 'client':
    case 'user':
      return <UserDashboard />;
    case 'professional':
      return <ProfessionalDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'support':
      return <SupportDashboard />;
    default:
      return <Navigate to="/login" />;
  }
}
