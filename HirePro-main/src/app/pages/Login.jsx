import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = {
    role: selectedRole ? '' : 'Select a role before signing in.',
    email: !email
      ? 'Email is required.'
      : !emailPattern.test(email)
      ? 'Enter a valid email address.'
      : '',
    password: !password
      ? 'Password is required.'
      : password.length < 8
      ? 'Password must be at least 8 characters.'
      : '',
  };

  const isFormValid = selectedRole && !errors.email && !errors.password;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error(errors.role);
      return;
    }

    if (errors.email || errors.password) {
      toast.error(errors.email || errors.password);
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password, role: selectedRole });
      toast.success('Successfully signed in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
  };

  const roles = [
    {
      role: 'client',
      title: 'Client',
      description: 'Find and hire professionals for your projects',
      icon: User,
      color: 'bg-blue-600',
      demoEmail: 'client@hirepro.com',
    },
    {
      role: 'professional',
      title: 'Professional',
      description: 'Offer your services and connect with clients',
      icon: Briefcase,
      color: 'bg-green-600',
      demoEmail: 'sarah@hirepro.com',
    },
  ];

  const currentRoleData = roles.find(r => r.role === selectedRole);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">Welcome to ProConnect</h1>
          <p className="text-gray-600">
            {selectedRole ? 'Enter your credentials to continue' : 'Select your role to continue'}
          </p>
        </div>

        {!selectedRole ? (
          // Role Selection View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map(({ role, title, description, icon: Icon, color }) => (
              <Card
                key={role}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleRoleSelect(role)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{description}</p>
                  <Button className="w-full">
                    Continue as {title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Login Form View
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <div className={`w-12 h-12 ${currentRoleData?.color} rounded-lg flex items-center justify-center mb-4`}>
                  {currentRoleData && <currentRoleData.icon className="w-6 h-6 text-white" />}
                </div>
                <CardTitle>Sign in as {currentRoleData?.title}</CardTitle>
                <CardDescription>{currentRoleData?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {email && errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {password && errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Demo Credentials:</p>
                    <p className="text-blue-700">Email: {currentRoleData?.demoEmail}</p>
                    <p className="text-blue-700">Password: demo12345</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToRoles}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting || !isFormValid}>
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate('/register')}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <p className="text-center text-sm text-gray-600 mt-8">
          Demo password for seeded accounts: demo12345
        </p>
      </div>
    </div>
  );
}
