import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, MapPin, Star, Filter, SlidersHorizontal } from 'lucide-react';
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
import { Slider } from '../components/ui/slider';
import { categories } from '../data';
import { fetchProfessionals } from '../lib/api';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [maxRate, setMaxRate] = useState([200]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetchProfessionals({
          search: searchQuery,
          category: selectedCategory,
          maxRate: maxRate[0],
          minRating,
        });

        if (!cancelled) {
          setProfessionals(response.professionals || []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfessionals();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCategory, maxRate, minRating]);

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((prof) => {
      const matchesSearch =
        searchQuery === '' ||
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'all' ||
        prof.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesRate = prof.hourlyRate <= maxRate[0];
      const matchesRating = prof.rating >= minRating;

      return matchesSearch && matchesCategory && matchesRate && matchesRating;
    });
  }, [professionals, searchQuery, selectedCategory, maxRate, minRating]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center border rounded-lg px-3">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <Input
                type="text"
                placeholder="Search professionals, skills, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-56">
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
            <Button onClick={handleSearch}>Search</Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`md:w-64 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Hourly Rate</h3>
                  <div className="space-y-4">
                    <Slider
                      value={maxRate}
                      onValueChange={setMaxRate}
                      max={200}
                      min={10}
                      step={5}
                    />
                    <p className="text-sm text-gray-600">Up to ${maxRate[0]}/hr</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="accent-blue-600"
                        />
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{rating}+</span>
                        </div>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === 0}
                        onChange={() => setMinRating(0)}
                        className="accent-blue-600"
                      />
                      <span>All Ratings</span>
                    </label>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMaxRate([200]);
                    setMinRating(0);
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-gray-600">
                {isLoading ? 'Loading professionals...' : `${filteredProfessionals.length} professionals found`}
              </p>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            {!isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProfessionals.map((professional) => (
                  <Card
                    key={professional.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/professional/${professional.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={professional.avatar} alt={professional.name} />
                          <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{professional.name}</h3>
                              <p className="text-sm text-gray-600">{professional.title}</p>
                            </div>
                            <Badge
                              variant={
                                professional.availability === 'available'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="capitalize"
                            >
                              {professional.availability}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {professional.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {professional.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{professional.rating}</span>
                                <span className="text-gray-600">
                                  ({professional.reviewCount})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {professional.location.split(',')[0]}
                              </div>
                            </div>
                            <p className="font-semibold text-blue-600">
                              ${professional.hourlyRate}/hr
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredProfessionals.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No professionals found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMaxRate([200]);
                      setMinRating(0);
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
