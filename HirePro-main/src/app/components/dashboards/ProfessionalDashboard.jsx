import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  DollarSign,
  Star,
  Briefcase,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { mockBookings, mockProfessionals } from '../../data';
import { toast } from 'sonner';

export default function ProfessionalDashboard() {
  const currentProfessional = mockProfessionals[0];
  const [editMode, setEditMode] = useState(false);

  // Mock incoming requests (in a real app, filter by professional ID)
  const incomingRequests = mockBookings.filter((b) => b.status === 'pending');
  const activeProjects = mockBookings.filter((b) => b.status === 'in-progress');

  const handleAcceptRequest = (id) => {
    toast.success('Request accepted!');
  };

  const handleDeclineRequest = (id) => {
    toast.error('Request declined');
  };

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${(currentProfessional.hourlyRate * currentProfessional.completedJobs * 20).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: '+12%',
    },
    {
      title: 'Active Projects',
      value: activeProjects.length,
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+3',
    },
    {
      title: 'Rating',
      value: currentProfessional.rating,
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      change: `${currentProfessional.reviewCount} reviews`,
    },
    {
      title: 'Completion Rate',
      value: '98%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: '+2%',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Professional Dashboard</h1>
          <p className="text-gray-600">Manage your services and client projects</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList>
                <TabsTrigger value="requests">
                  Requests ({incomingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="active">Active Projects ({activeProjects.length})</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="requests">
                <div className="space-y-4">
                  {incomingRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">New Project Request</h3>
                            <p className="text-sm text-gray-600">
                              Received {new Date(request.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </div>
                        <p className="text-gray-700 mb-4">{request.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-blue-600">
                            Est. ${request.amount.toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineRequest(request.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                            <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {incomingRequests.length === 0 && (
                    <Card>
                      <CardContent className="p-12 text-center text-gray-600">
                        No pending requests
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="active">
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <Card key={project.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Active Project</h3>
                            <p className="text-sm text-gray-600">
                              Started {new Date(project.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                        </div>
                        <p className="text-gray-700 mb-4">{project.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-green-600">
                            ${project.amount.toLocaleString()}
                          </span>
                          <Button size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message Client
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {activeProjects.length === 0 && (
                    <Card>
                      <CardContent className="p-12 text-center text-gray-600">
                        No active projects
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Profile Settings</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Professional Title</Label>
                        <Input
                          value={currentProfessional.title}
                          disabled={!editMode}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Hourly Rate ($)</Label>
                        <Input
                          type="number"
                          value={currentProfessional.hourlyRate}
                          disabled={!editMode}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={currentProfessional.description}
                        disabled={!editMode}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Skills (comma separated)</Label>
                      <Input
                        value={currentProfessional.skills.join(', ')}
                        disabled={!editMode}
                        className="mt-2"
                      />
                    </div>
                    {editMode && (
                      <Button className="w-full">Save Changes</Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={currentProfessional.avatar} alt={currentProfessional.name} />
                  <AvatarFallback>{currentProfessional.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg mb-1">{currentProfessional.name}</h3>
                <p className="text-gray-600 mb-3">{currentProfessional.title}</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{currentProfessional.rating}</span>
                  <span className="text-gray-600">({currentProfessional.reviewCount})</span>
                </div>
                <Badge variant="secondary">{currentProfessional.category}</Badge>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Completed</span>
                  <span className="font-semibold">{currentProfessional.completedJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">{currentProfessional.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability</span>
                  <Badge
                    variant={
                      currentProfessional.availability === 'available'
                        ? 'default'
                        : 'secondary'
                    }
                    className="capitalize"
                  >
                    {currentProfessional.availability}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
