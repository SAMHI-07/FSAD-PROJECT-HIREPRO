import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Search,
  Shield,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { mockProfessionals, mockBookings, categories } from '../../data';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const totalUsers = 1247;
  const totalProfessionals = mockProfessionals.length;
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.amount, 0);
  const platformFee = totalRevenue * 0.15;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+12% this month',
    },
    {
      title: 'Active Professionals',
      value: totalProfessionals,
      icon: Briefcase,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: '+8 new this week',
    },
    {
      title: 'Platform Revenue',
      value: `$${platformFee.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: '+23% growth',
    },
    {
      title: 'Total Bookings',
      value: mockBookings.length * 127,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      change: `${mockBookings.filter(b => b.status === 'in-progress').length * 45} active`,
    },
  ];

  const filteredProfessionals = mockProfessionals.filter((prof) => {
    const matchesSearch =
      searchQuery === '' ||
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || prof.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVerifyProfessional = (id) => {
    toast.success('Professional verified successfully');
  };

  const handleSuspendUser = (id) => {
    toast.error('User suspended');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform settings, users, and services</p>
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
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-semibold mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="professionals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="professionals">Professionals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="professionals">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <CardTitle>Manage Professionals</CardTitle>
                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search professionals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProfessionals.map((professional) => (
                    <div
                      key={professional.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={professional.avatar} alt={professional.name} />
                        <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{professional.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {professional.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{professional.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {professional.completedJobs} jobs
                          </span>
                          <span>${professional.hourlyRate}/hr</span>
                          <span>⭐ {professional.rating}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyProfessional(professional.id)}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendUser(professional.id)}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, name: 'John Davis', email: 'john@example.com', role: 'Client', joined: '2026-01-15' },
                    { id: 2, name: 'Lisa Anderson', email: 'lisa@example.com', role: 'Client', joined: '2026-02-03' },
                    { id: 3, name: 'Mark Thompson', email: 'mark@example.com', role: 'Client', joined: '2026-02-18' },
                  ].map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="secondary">{user.role}</Badge>
                          <p className="text-xs text-gray-600 mt-1">Joined {user.joined}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBookings.map((booking) => {
                    const professional = mockProfessionals.find(p => p.id === booking.professionalId);
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      'in-progress': 'bg-blue-100 text-blue-800',
                      completed: 'bg-green-100 text-green-800',
                      cancelled: 'bg-red-100 text-red-800',
                    };
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{professional?.name}</h3>
                            <Badge className={statusColors[booking.status]}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{booking.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${booking.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            Fee: ${(booking.amount * 0.15).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform Fee (%)</label>
                    <Input type="number" defaultValue="15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Booking</label>
                    <Input type="number" defaultValue="50" />
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {categories.slice(0, 5).map((category) => (
                      <div
                        key={category}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>{category}</span>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    Add New Category
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
