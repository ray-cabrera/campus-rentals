import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Shield } from 'lucide-react';

const categoryColors = {
  'Tech': 'bg-blue-500',
  'Electronics': 'bg-blue-500',
  'Tools': 'bg-yellow-500',
  'Fashion': 'bg-pink-500',
  'Sports': 'bg-green-500',
  'Party Supplies': 'bg-purple-500',
  'Academic': 'bg-indigo-500',
  'Transportation': 'bg-red-500',
  'Outdoor': 'bg-teal-500',
  'Music': 'bg-orange-500',
  'Wellness': 'bg-emerald-500',
};

const ItemCard = ({ item }) => {
  const images = JSON.parse(item.images || '[]');
  const imageUrl = images[0] || '/placeholder-item.jpg';

  // Use placeholder images based on category for demo
  const getPlaceholderImage = (category) => {
    const placeholders = {
      'Tech': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
      'Electronics': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',
      'Tools': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&h=300&fit=crop',
      'Fashion': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1461896836934- voices?w=400&h=300&fit=crop',
      'Party Supplies': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
      'Academic': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      'Transportation': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'Outdoor': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop',
      'Music': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
      'Wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    };
    return placeholders[category] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
  };

  const displayImage = imageUrl.startsWith('http') ? imageUrl : getPlaceholderImage(item.category);

  return (
    <Link to={`/items/${item.id}`} className="card card-hover block">
      <div className="relative">
        <img
          src={displayImage}
          alt={item.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = getPlaceholderImage(item.category);
          }}
        />
        <div className={`absolute top-3 left-3 px-2 py-1 ${categoryColors[item.category] || 'bg-gray-500'} text-white text-xs font-medium rounded`}>
          {item.category}
        </div>
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              Currently Rented
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-3">
          {item.price_hour && (
            <div>
              <span className="text-princeton-orange font-bold">${item.price_hour}</span>
              <span className="text-gray-500"> / hour</span>
            </div>
          )}
          <div>
            <span className="text-princeton-orange font-bold">${item.price_day}</span>
            <span className="text-gray-500"> / day</span>
          </div>
          {item.price_week && (
            <div>
              <span className="text-princeton-orange font-bold">${item.price_week}</span>
              <span className="text-gray-500"> / week</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{item.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-700">{item.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
