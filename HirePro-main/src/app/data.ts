import { Professional, Service, Booking, Review, SupportTicket } from './types';

export const categories = [
  'Web Development',
  'Mobile Development',
  'Design',
  'Marketing',
  'Writing',
  'Legal',
  'Consulting',
  'Photography',
  'Video Production',
  'Accounting',
  'Translation',
  'Virtual Assistant'
];

export const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Full Stack Developer',
    category: 'Web Development',
    description: 'Experienced full-stack developer specializing in React, Node.js, and cloud infrastructure. 8+ years building scalable web applications.',
    hourlyRate: 85,
    rating: 4.9,
    reviewCount: 127,
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    experience: '8 years',
    availability: 'available',
    completedJobs: 245,
    responseTime: '2 hours'
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'UI/UX Designer',
    category: 'Design',
    description: 'Creative designer with a passion for crafting beautiful, user-centered digital experiences. Specialized in mobile and web design.',
    hourlyRate: 75,
    rating: 4.8,
    reviewCount: 93,
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    experience: '6 years',
    availability: 'available',
    completedJobs: 178,
    responseTime: '1 hour'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    title: 'Digital Marketing Specialist',
    category: 'Marketing',
    description: 'Results-driven marketer helping businesses grow through data-driven strategies. Expert in SEO, PPC, and social media marketing.',
    hourlyRate: 65,
    rating: 4.9,
    reviewCount: 156,
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    skills: ['SEO', 'Google Ads', 'Social Media', 'Analytics', 'Content Strategy'],
    experience: '7 years',
    availability: 'busy',
    completedJobs: 312,
    responseTime: '4 hours'
  },
  {
    id: '4',
    name: 'David Thompson',
    title: 'Mobile App Developer',
    category: 'Mobile Development',
    description: 'iOS and Android developer creating high-performance mobile applications. Specialized in React Native and Flutter.',
    hourlyRate: 90,
    rating: 4.7,
    reviewCount: 84,
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    experience: '5 years',
    availability: 'available',
    completedJobs: 156,
    responseTime: '3 hours'
  },
  {
    id: '5',
    name: 'Jennifer Kim',
    title: 'Content Writer & Copywriter',
    category: 'Writing',
    description: 'Professional writer crafting compelling content for websites, blogs, and marketing materials. SEO-optimized and conversion-focused.',
    hourlyRate: 50,
    rating: 4.9,
    reviewCount: 201,
    location: 'Los Angeles, CA',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    skills: ['Copywriting', 'SEO Writing', 'Technical Writing', 'Editing', 'Research'],
    experience: '9 years',
    availability: 'available',
    completedJobs: 423,
    responseTime: '1 hour'
  },
  {
    id: '6',
    name: 'Robert Martinez',
    title: 'Business Consultant',
    category: 'Consulting',
    description: 'Strategic business consultant helping startups and SMEs optimize operations and drive growth. MBA with 15 years of experience.',
    hourlyRate: 120,
    rating: 4.8,
    reviewCount: 67,
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    skills: ['Strategy', 'Operations', 'Financial Planning', 'Market Analysis', 'Leadership'],
    experience: '15 years',
    availability: 'available',
    completedJobs: 198,
    responseTime: '6 hours'
  },
  {
    id: '7',
    name: 'Amanda Foster',
    title: 'Professional Photographer',
    category: 'Photography',
    description: 'Award-winning photographer specializing in commercial, portrait, and event photography. Available for projects worldwide.',
    hourlyRate: 95,
    rating: 5.0,
    reviewCount: 142,
    location: 'Miami, FL',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    skills: ['Portrait', 'Commercial', 'Event', 'Editing', 'Lighting'],
    experience: '10 years',
    availability: 'available',
    completedJobs: 267,
    responseTime: '2 hours'
  },
  {
    id: '8',
    name: 'James Wilson',
    title: 'Video Editor & Producer',
    category: 'Video Production',
    description: 'Creative video professional producing high-quality content for brands, YouTube, and social media. Expert in post-production.',
    hourlyRate: 70,
    rating: 4.8,
    reviewCount: 109,
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    skills: ['Adobe Premiere', 'After Effects', 'Color Grading', 'Motion Graphics', 'Sound Design'],
    experience: '7 years',
    availability: 'busy',
    completedJobs: 234,
    responseTime: '5 hours'
  }
];

export const mockServices: Service[] = [
  {
    id: 's1',
    professionalId: '1',
    title: 'Full Stack Web Application Development',
    description: 'Complete web application development from concept to deployment',
    price: 5000,
    duration: '4-6 weeks',
    category: 'Web Development'
  },
  {
    id: 's2',
    professionalId: '2',
    title: 'UI/UX Design Package',
    description: 'Complete design system and user interface for your application',
    price: 3000,
    duration: '2-3 weeks',
    category: 'Design'
  },
  {
    id: 's3',
    professionalId: '3',
    title: 'Digital Marketing Campaign',
    description: 'Comprehensive marketing strategy and execution',
    price: 2500,
    duration: '1 month',
    category: 'Marketing'
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    professionalId: '1',
    userId: 'user1',
    status: 'in-progress',
    date: '2026-02-20T10:00:00Z',
    message: 'Need help building an e-commerce platform',
    amount: 5000
  },
  {
    id: 'b2',
    professionalId: '2',
    userId: 'user1',
    status: 'completed',
    date: '2026-01-15T14:00:00Z',
    message: 'Looking for a modern website redesign',
    amount: 3000
  },
  {
    id: 'b3',
    professionalId: '3',
    userId: 'user1',
    status: 'pending',
    date: '2026-02-28T09:00:00Z',
    message: 'Need marketing strategy for product launch',
    amount: 2500
  }
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    professionalId: '1',
    userId: 'user1',
    userName: 'John Davis',
    rating: 5,
    comment: 'Excellent developer! Delivered the project on time and exceeded expectations. Highly recommended!',
    date: '2026-02-15T10:00:00Z'
  },
  {
    id: 'r2',
    professionalId: '1',
    userId: 'user2',
    userName: 'Lisa Anderson',
    rating: 5,
    comment: 'Sarah is incredibly talented and professional. Great communication throughout the project.',
    date: '2026-02-10T14:30:00Z'
  },
  {
    id: 'r3',
    professionalId: '2',
    userId: 'user3',
    userName: 'Mark Thompson',
    rating: 5,
    comment: 'Amazing designer! The UI/UX work was top-notch and our users love the new design.',
    date: '2026-02-12T16:00:00Z'
  }
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 't1',
    userId: 'user1',
    userName: 'John Davis',
    subject: 'Payment issue',
    message: 'I am having trouble processing my payment for a booking.',
    status: 'open',
    priority: 'high',
    createdAt: '2026-02-26T08:00:00Z'
  },
  {
    id: 't2',
    userId: 'user2',
    userName: 'Lisa Anderson',
    subject: 'Profile verification',
    message: 'How long does profile verification take?',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-02-25T14:00:00Z',
    assignedTo: 'Support Agent 1'
  },
  {
    id: 't3',
    userId: 'user3',
    userName: 'Mark Thompson',
    subject: 'Cannot find professional',
    message: 'The search function is not returning any results for my query.',
    status: 'resolved',
    priority: 'low',
    createdAt: '2026-02-24T10:00:00Z',
    assignedTo: 'Support Agent 2'
  }
];
