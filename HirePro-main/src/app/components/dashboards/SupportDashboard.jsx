import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Headphones,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageCircle,
  Search,
  Send,
} from 'lucide-react';
import { mockSupportTickets } from '../../data';
import { toast } from 'sonner';

export default function SupportDashboard() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = mockSupportTickets.filter((ticket) => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openTickets = mockSupportTickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = mockSupportTickets.filter((t) => t.status === 'in-progress').length;
  const resolvedTickets = mockSupportTickets.filter((t) => t.status === 'resolved').length;

  const handleAssignTicket = (ticketId) => {
    toast.success('Ticket assigned to you');
  };

  const handleResolveTicket = (ticketId) => {
    toast.success('Ticket marked as resolved');
  };

  const handleSendResponse = () => {
    if (response.trim()) {
      toast.success('Response sent successfully');
      setResponse('');
    }
  };

  const stats = [
    {
      title: 'Open Tickets',
      value: openTickets,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'In Progress',
      value: inProgressTickets,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Resolved Today',
      value: resolvedTickets,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Avg Response Time',
      value: '24m',
      icon: Headphones,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800',
  };

  const currentTicket = selectedTicket
    ? mockSupportTickets.find((t) => t.id === selectedTicket)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Support Dashboard</h1>
          <p className="text-gray-600">Assist users and resolve platform issues</p>
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
                  <div
                    className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support Tickets</CardTitle>
                <div className="flex flex-col gap-3 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tickets</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedTicket === ticket.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm">{ticket.subject}</h3>
                        <Badge className={priorityColors[ticket.priority]} variant="secondary">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{ticket.userName}</p>
                      <div className="flex items-center justify-between">
                        <Badge className={statusColors[ticket.status]} variant="secondary">
                          {ticket.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredTickets.length === 0 && (
                    <div className="p-8 text-center text-gray-600">No tickets found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {currentTicket ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{currentTicket.subject}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted by {currentTicket.userName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusColors[currentTicket.status]}>
                        {currentTicket.status}
                      </Badge>
                      <Badge className={priorityColors[currentTicket.priority]}>
                        {currentTicket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Ticket Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ticket ID:</span>
                        <p className="font-semibold">{currentTicket.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <p className="font-semibold">
                          {new Date(currentTicket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">User ID:</span>
                        <p className="font-semibold">{currentTicket.userId}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Assigned To:</span>
                        <p className="font-semibold">
                          {currentTicket.assignedTo || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Original Message */}
                  <div>
                    <h3 className="font-semibold mb-2">Original Message</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{currentTicket.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">
                            {currentTicket.userName}
                          </p>
                          <p className="text-gray-700">{currentTicket.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Response Area */}
                  <div>
                    <h3 className="font-semibold mb-2">Your Response</h3>
                    <Textarea
                      placeholder="Type your response here..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={6}
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSendResponse} className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </Button>
                      {currentTicket.status !== 'resolved' && (
                        <Button
                          variant="outline"
                          onClick={() => handleResolveTicket(currentTicket.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {currentTicket.status === 'open' && !currentTicket.assignedTo && (
                    <div className="border-t pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleAssignTicket(currentTicket.id)}
                      >
                        Assign to Me
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Ticket Selected</h3>
                  <p className="text-gray-600">
                    Select a ticket from the list to view details and respond
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
