import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Search,
  Briefcase,
  Clock,
  CheckCircle,
  Star,
  MessageCircle,
  DollarSign,
} from 'lucide-react';
import { mockBookings, mockProfessionals } from '../../data';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  const userBookings = mockBookings.map((booking) => ({
    ...booking,
    professional: mockProfessionals.find((p) => p.id === booking.professionalId),
  }));

  const handleReview = (bookingId) => {
    setSelectedBooking(bookingId);
    setShowReviewDialog(true);
  };

  const submitReview = () => {
    // In a real app, this would submit to the backend
    setShowReviewDialog(false);
    setReviewText('');
    setRating(5);
  };

  const stats = [
    {
      title: 'Active Projects',
      value: userBookings.filter((b) => b.status === 'in-progress').length,
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pending Requests',
      value: userBookings.filter((b) => b.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Completed',
      value: userBookings.filter((b) => b.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Spent',
      value: `$${userBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Client Dashboard</h1>
          <p className="text-gray-600">Manage your projects and find professionals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => navigate('/search')} size="lg" className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Find Professionals
              </Button>
              <Button
                onClick={() => navigate('/search')}
                size="lg"
                variant="outline"
                className="flex-1"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Categories
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-4">
              {userBookings
                .filter((b) => b.status === 'in-progress')
                .map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={booking.professional?.avatar}
                            alt={booking.professional?.name}
                          />
                          <AvatarFallback>
                            {booking.professional?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.professional?.name}
                              </h3>
                              <p className="text-gray-600">
                                {booking.professional?.title}
                              </p>
                            </div>
                            <Badge className={statusColors[booking.status]}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-4">{booking.message}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-gray-600">
                              Started: {new Date(booking.date).toLocaleDateString()}
                            </span>
                            <span className="font-semibold text-blue-600">
                              ${booking.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/professional/${booking.professionalId}`)
                              }
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {userBookings.filter((b) => b.status === 'in-progress').length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No active projects</h3>
                    <p className="text-gray-600 mb-4">Start a new project by hiring a professional</p>
                    <Button onClick={() => navigate('/search')}>Find Professionals</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="space-y-4">
              {userBookings
                .filter((b) => b.status === 'pending')
                .map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={booking.professional?.avatar}
                            alt={booking.professional?.name}
                          />
                          <AvatarFallback>
                            {booking.professional?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.professional?.name}
                              </h3>
                              <p className="text-gray-600">
                                {booking.professional?.title}
                              </p>
                            </div>
                            <Badge className={statusColors[booking.status]}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-4">{booking.message}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-gray-600">
                              Requested: {new Date(booking.date).toLocaleDateString()}
                            </span>
                            <span className="font-semibold text-blue-600">
                              ${booking.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {userBookings.filter((b) => b.status === 'pending').length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center text-gray-600">
                    No pending requests
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {userBookings
                .filter((b) => b.status === 'completed')
                .map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={booking.professional?.avatar}
                            alt={booking.professional?.name}
                          />
                          <AvatarFallback>
                            {booking.professional?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.professional?.name}
                              </h3>
                              <p className="text-gray-600">
                                {booking.professional?.title}
                              </p>
                            </div>
                            <Badge className={statusColors[booking.status]}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-4">{booking.message}</p>
                          <div className="flex flex-wrap gap-4 text-sm mb-4">
                            <span className="text-gray-600">
                              Completed: {new Date(booking.date).toLocaleDateString()}
                            </span>
                            <span className="font-semibold text-green-600">
                              ${booking.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReview(booking.id)}>
                              <Star className="w-4 h-4 mr-2" />
                              Leave Review
                            </Button>
                            <Button size="sm" variant="outline">
                              Hire Again
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {userBookings.filter((b) => b.status === 'completed').length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center text-gray-600">
                    No completed projects yet
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <Textarea
                placeholder="Share your experience working with this professional..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={submitReview} className="flex-1" disabled={!reviewText.trim()}>
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
