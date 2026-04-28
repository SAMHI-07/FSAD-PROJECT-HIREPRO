import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Star, Filter, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { mockProfessionals, categories } from '../data';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = () => {
    navigate(`/search?q=${searchQuery}&category=${selectedCategory}`);
  };

  const featuredProfessionals = mockProfessionals.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl mb-6">
              Find the Perfect Professional for Any Job
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Connect with skilled professionals across all industries. Get quality work done on time, every time.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-3">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <Input
                  type="text"
                  placeholder="What service are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="md:w-48 border-0 focus:ring-0">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} size="lg" className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category) => (
              <Card
                key={category}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/search?category=${category.toLowerCase()}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Filter className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm">{category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">Featured Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProfessionals.map((professional) => (
              <Card
                key={professional.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/professional/${professional.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-4">
                      <AvatarImage src={professional.avatar} alt={professional.name} />
                      <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{professional.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{professional.title}</p>
                    <Badge variant="secondary" className="mb-3">
                      {professional.category}
                    </Badge>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{professional.rating}</span>
                      <span className="text-sm text-gray-600">
                        ({professional.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {professional.location}
                    </div>
                    <p className="font-semibold text-blue-600">
                      ${professional.hourlyRate}/hr
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/search')} size="lg" variant="outline">
              View All Professionals
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl mb-3">Search & Discover</h3>
              <p className="text-gray-600">
                Browse through thousands of verified professionals across various categories.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl mb-3">Connect & Hire</h3>
              <p className="text-gray-600">
                Review profiles, compare rates, and hire the perfect professional for your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl mb-3">Get Results</h3>
              <p className="text-gray-600">
                Work together, track progress, and receive high-quality results on time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied clients and professionals on ProConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/search')}>
              Find Professionals
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => navigate('/register')}
            >
              Become a Professional
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
