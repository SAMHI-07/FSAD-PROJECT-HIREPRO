export type UserRole = 'user' | 'professional' | 'admin' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Professional {
  id: string;
  name: string;
  title: string;
  category: string;
  description: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: string;
  avatar: string;
  skills: string[];
  experience: string;
  availability: 'available' | 'busy' | 'offline';
  completedJobs: number;
  responseTime: string;
}

export interface Service {
  id: string;
  professionalId: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  category: string;
}

export interface Booking {
  id: string;
  professionalId: string;
  userId: string;
  serviceId?: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  date: string;
  message: string;
  amount: number;
  professional?: Professional;
}

export interface Review {
  id: string;
  professionalId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  assignedTo?: string;
}
