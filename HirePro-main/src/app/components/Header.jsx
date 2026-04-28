import { Link, useNavigate } from 'react-router';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Briefcase, LogOut, LayoutDashboard, User } from 'lucide-react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold">ProConnect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/search" className="hover:text-blue-600 transition-colors">
            Find Professionals
          </Link>
          <Link to="/register" className="hover:text-blue-600 transition-colors">
            Become a Professional
          </Link>
          <Link to="/manage-data" className="hover:text-blue-600 transition-colors">
            Manage Data
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} alt={user?.fullName || user?.name} />
                    <AvatarFallback>{(user?.fullName || user?.name || 'U').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user?.fullName || user?.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button onClick={() => navigate('/login')} variant="ghost" className="hidden md:inline-flex">
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')} variant="default">
                <User className="w-4 h-4 mr-2 md:hidden" />
                <span className="hidden md:inline">Get Started</span>
                <span className="md:hidden">Join</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
