import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../utils/api';
import { Search, Filter, MapPin, Star, DollarSign } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Tools',
  'Fashion',
  'Sports',
  'Party Supplies',
  'Academic',
  'Transportation',
  'Outdoor',
  'Music',
  'Wellness',
];

const BrowsePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.minPrice && { min_price: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { max_price: parseFloat(filters.maxPrice) }),
      };

      const response = await itemsAPI.getAll(params);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category });
  };

  const parseImages = (imagesJson) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://via.placeholder.com/400x300?text=No+Image';
    } catch {
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Items</h1>
        <p className="text-gray-600">Discover items available for rent from your fellow students</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for cameras, tools, formal wear..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.category === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Price Range */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 flex-1">
            <DollarSign size={20} className="text-gray-400" />
            <input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="input-field flex-1"
              min="0"
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="input-field"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${items.length} items available`}
        </p>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-gray-200 h-48 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found matching your criteria</p>
          <button
            onClick={() => setFilters({ search: '', category: 'All', minPrice: '', maxPrice: '' })}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="card group cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={parseImages(item.images)}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="badge bg-primary-600 text-white px-3 py-1">
                    {item.category}
                  </span>
                </div>
                {!item.is_available && (
                  <div className="absolute top-2 right-2">
                    <span className="badge badge-danger">Rented</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-primary-600">${item.daily_rate}</span>
                    <span className="text-xs text-gray-500">per day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({item.total_ratings})</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
