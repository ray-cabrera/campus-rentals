import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { items as itemsApi } from '../utils/api';
import ItemCard from '../components/ItemCard';
import {
  Search,
  Camera,
  Wrench,
  Shirt,
  Bike,
  Music,
  Sparkles,
  Shield,
  DollarSign,
  Users,
  ChevronRight,
  Star,
  ArrowRight,
  Zap
} from 'lucide-react';

const categories = [
  { name: 'Tech', icon: Camera, color: 'bg-blue-100 text-blue-600' },
  { name: 'Tools', icon: Wrench, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
  { name: 'Transportation', icon: Bike, color: 'bg-red-100 text-red-600' },
  { name: 'Music', icon: Music, color: 'bg-purple-100 text-purple-600' },
  { name: 'Party Supplies', icon: Sparkles, color: 'bg-indigo-100 text-indigo-600' },
];

const stats = [
  { value: '500+', label: 'Items Listed', icon: Shield },
  { value: '$50K+', label: 'Student Earnings', icon: DollarSign },
  { value: '2,000+', label: 'Active Users', icon: Users },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await itemsApi.list({ limit: 8 });
        setFeaturedItems(response.data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/browse');
    }
  };

  const handleQuickDemo = () => {
    navigate('/login', { state: { demo: true } });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-princeton-orange/20 text-princeton-orange px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Princeton's #1 Student Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-slide-up">
              Share More,{' '}
              <span className="text-princeton-orange">Spend Less</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up">
              The peer-to-peer marketplace for college students. Rent cameras, tools, formal wear, and more from fellow students on campus.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-slide-up">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for cameras, tools, formal wear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 bg-white text-gray-900 rounded-xl shadow-lg focus:ring-2 focus:ring-princeton-orange outline-none text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 btn-primary py-2"
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link to="/browse" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
                Browse Items
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={handleQuickDemo}
                  className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-3"
                >
                  Quick Demo
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 animate-fade-in">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-princeton-orange mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find exactly what you need from our diverse selection of student-owned items
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/browse?category=${encodeURIComponent(category.name)}`}
                className="group p-6 bg-gray-50 rounded-xl hover:bg-princeton-orange hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/20 group-hover:text-white transition-colors`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Items
              </h2>
              <p className="text-gray-600">Popular rentals from students on campus</p>
            </div>
            <Link to="/browse" className="hidden sm:flex items-center gap-2 text-princeton-orange hover:text-princeton-orange-dark font-semibold">
              View All
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/browse" className="btn-primary">
              View All Items
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Renting and listing items is quick, easy, and secure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Find What You Need',
                description: 'Browse through hundreds of items listed by students. Filter by category, location, and price.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Request & Connect',
                description: 'Send a rental request with your dates. Chat with the owner and arrange pickup details.',
                icon: Users,
              },
              {
                step: '03',
                title: 'Rent with Confidence',
                description: 'Every rental is covered by $2,000 insurance. Use QR codes for secure pickup and return.',
                icon: Shield,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative p-8 bg-gray-50 rounded-2xl">
                <div className="text-6xl font-bold text-gray-100 absolute top-4 right-6">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="w-14 h-14 bg-princeton-orange rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings CTA */}
      <section className="py-16 bg-princeton-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-white text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-4">
                Turn Your Stuff Into Cash
              </h2>
              <p className="text-orange-100 text-lg max-w-xl">
                Students on Campus Rentals earn an average of $500+ per semester renting out items they already own. Why let your camera or bike sit unused?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={isAuthenticated ? '/add-item' : '/register'}
                className="bg-white text-princeton-orange hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors text-center"
              >
                Start Earning Today
              </Link>
              <Link
                to="/browse"
                className="border-2 border-white text-white hover:bg-white hover:text-princeton-orange font-semibold py-3 px-8 rounded-lg transition-colors text-center"
              >
                See What Others List
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                $2,000 Insurance Coverage
              </h3>
              <p className="text-gray-600">
                Every rental is automatically protected against damage and loss
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Verified Students Only
              </h3>
              <p className="text-gray-600">
                All users verify with their .edu email for a trusted community
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Ratings & Reviews
              </h3>
              <p className="text-gray-600">
                Read honest reviews from fellow students before renting
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
