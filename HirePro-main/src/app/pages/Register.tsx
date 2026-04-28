import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Briefcase, User, ChevronRight } from 'lucide-react';
import { categories } from '../data';
import { toast } from 'sonner';
import { registerUser } from '../lib/api';

type RegistrationType = 'client' | 'professional' | null;
type FormErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+]?[0-9()\-\s]{10,20}$/;

function isValidUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (error) {
    return false;
  }
}

export default function Register() {
  const navigate = useNavigate();
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null);
  const [step, setStep] = useState(1);

  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // Professional-specific fields
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [category, setCategory] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getValidationErrors = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!registrationType) {
      nextErrors.registrationType = 'Choose a registration type.';
      return nextErrors;
    }

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (phone && !phonePattern.test(phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number.';
    }

    if (step < 2) {
      return nextErrors;
    }

    if (!agreeToTerms) {
      nextErrors.agreeToTerms = 'You must accept the terms and conditions.';
    }

    if (registrationType === 'professional') {
      if (!professionalTitle.trim()) {
        nextErrors.professionalTitle = 'Professional title is required.';
      }

      if (!category) {
        nextErrors.category = 'Select a category.';
      }

      if (!hourlyRate) {
        nextErrors.hourlyRate = 'Hourly rate is required.';
      } else if (Number(hourlyRate) <= 0) {
        nextErrors.hourlyRate = 'Hourly rate must be greater than 0.';
      }

      if (!bio.trim()) {
        nextErrors.bio = 'Professional bio is required.';
      } else if (bio.trim().length < 30) {
        nextErrors.bio = 'Bio should be at least 30 characters.';
      }

      if (portfolio && !isValidUrl(portfolio.trim())) {
        nextErrors.portfolio = 'Enter a valid http or https URL.';
      }
    }

    return nextErrors;
  };

  const errors = getValidationErrors();
  const canContinueStepOne =
    !!registrationType &&
    !errors.fullName &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword &&
    !errors.phone;
  const canSubmit = Object.keys(errors).length === 0;

  const handleTypeSelect = (type: RegistrationType) => {
    setRegistrationType(type);
    setStep(1);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!canContinueStepOne) {
        toast.error(
          errors.fullName ||
            errors.email ||
            errors.password ||
            errors.confirmPassword ||
            errors.phone
        );
        return;
      }

      setStep(2);
      return;
    }

    if (!canSubmit) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await registerUser({
        fullName,
        email,
        password,
        role: registrationType,
        phone,
        location,
        professionalTitle,
        category,
        hourlyRate,
        experience,
        bio,
        skills,
        portfolio,
        company,
        industry,
      });
      toast.success('Account created successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setRegistrationType(null);
    }
  };

  if (!registrationType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2">Join ProConnect</h1>
            <p className="text-gray-600">Choose how you want to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleTypeSelect('client')}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Join as a Client</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Find and hire talented professionals for your projects
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Browse thousands of professionals
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Post projects and receive proposals
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Secure payment protection
                  </li>
                </ul>
                <Button className="w-full">Create Client Account</Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleTypeSelect('professional')}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Join as a Professional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Offer your services and grow your business
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Connect with clients worldwide
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Build your professional reputation
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Get paid for your expertise
                  </li>
                </ul>
                <Button className="w-full">Create Professional Account</Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2">
            {registrationType === 'client' ? 'Create Client Account' : 'Create Professional Account'}
          </h1>
          <p className="text-gray-600">
            Step {step} of {registrationType === 'professional' ? '2' : '2'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? 'Account Information' : registrationType === 'professional' ? 'Professional Details' : 'Additional Information'}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? 'Enter your basic account details'
                : registrationType === 'professional'
                ? 'Tell us about your professional experience'
                : 'Complete your profile'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNextStep} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, State"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && registrationType === 'professional' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="professionalTitle">Professional Title *</Label>
                    <Input
                      id="professionalTitle"
                      placeholder="e.g., Full Stack Developer"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      required
                    />
                    {errors.professionalTitle && (
                      <p className="text-sm text-red-600">{errors.professionalTitle}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        placeholder="50"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        required
                      />
                      {errors.hourlyRate && <p className="text-sm text-red-600">{errors.hourlyRate}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      placeholder="e.g., 5 years"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      placeholder="Describe your experience, expertise, and what makes you unique..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      required
                    />
                    {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input
                      id="skills"
                      placeholder="React, Node.js, TypeScript, AWS"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio/Website URL</Label>
                    <Input
                      id="portfolio"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                    />
                    {errors.portfolio && <p className="text-sm text-red-600">{errors.portfolio}</p>}
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                      I agree to the{' '}
                      <button type="button" className="text-blue-600 hover:underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </>
              )}

              {step === 2 && registrationType === 'client' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name (Optional)</Label>
                    <Input
                      id="company"
                      placeholder="Your company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                      I agree to the{' '}
                      <button type="button" className="text-blue-600 hover:underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || (step === 1 ? !canContinueStepOne : !canSubmit)}
                >
                  {step === 1 ? 'Continue' : isSubmitting ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
