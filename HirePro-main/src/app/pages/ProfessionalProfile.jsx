import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  MapPin,
  Star,
  Clock,
  CheckCircle,
  MessageCircle,
  Award,
  Briefcase,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { fetchProfessionalById } from '../lib/api';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [professional, setProfessional] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfessional() {
      try {
        setIsLoading(true);
        const response = await fetchProfessionalById(id);
        if (!cancelled) {
          setProfessional(response);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message);
          navigate('/search');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfessional();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const professionalReviews = professional?.reviews || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading professional...</h2>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Professional not found</h2>
        <Button onClick={() => navigate('/search')}>Back to Search</Button>
      </div>
    );
  }

  const handleHire = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to hire professionals');
      navigate('/login');
      return;
    }
    setShowHireDialog(true);
  };

  const submitHireRequest = () => {
    toast.success('Hire request sent successfully!');
    setShowHireDialog(false);
    setMessage('');
    if (user?.role === 'user') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={professional.avatar} alt={professional.name} />
                    <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="text-3xl font-semibold mb-1">{professional.name}</h1>
                        <p className="text-xl text-gray-600 mb-3">{professional.title}</p>
                      </div>
                      <Badge
                        variant={
                          professional.availability === 'available' ? 'default' : 'secondary'
                        }
                        className="capitalize text-sm"
                      >
                        {professional.availability}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">{professional.rating}</span>
                        <span className="text-gray-600">
                          ({professional.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        {professional.location}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <CheckCircle className="w-5 h-5" />
                        {professional.completedJobs} jobs completed
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>Responds in {professional.responseTime}</span>
                    </div>
                    <p className="text-gray-700">{professional.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {professional.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {professional.experience} of professional experience in {professional.category}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({professionalReviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {professionalReviews.length > 0 ? (
                  professionalReviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hire Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-semibold text-blue-600 mb-1">
                    ${professional.hourlyRate}
                    <span className="text-lg text-gray-600">/hour</span>
                  </p>
                </div>
                <Button onClick={handleHire} className="w-full mb-3" size="lg">
                  Hire {professional.name.split(' ')[0]}
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <Badge variant="secondary">{professional.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">{professional.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Jobs</span>
                  <span className="font-semibold">{professional.completedJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold">{professional.experience}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hire Dialog */}
      <Dialog open={showHireDialog} onOpenChange={setShowHireDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hire {professional.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Project Description</Label>
              <Textarea
                id="message"
                placeholder="Describe your project and requirements..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-2"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Hourly Rate:</span>
                <span className="font-semibold">${professional.hourlyRate}/hr</span>
              </div>
              <p className="text-sm text-gray-600">
                You'll be able to discuss the project scope and timeline with{' '}
                {professional.name.split(' ')[0]} after sending this request.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowHireDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={submitHireRequest} className="flex-1" disabled={!message.trim()}>
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
