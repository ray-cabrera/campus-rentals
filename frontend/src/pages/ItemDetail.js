import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { items as itemsApi, rentals as rentalsApi, messages as messagesApi } from '../utils/api';
import {
  Star,
  MapPin,
  Shield,
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  User,
  AlertCircle
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Rental form state
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Message form state
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await itemsApi.get(id);
        setItem(response.data);
      } catch (error) {
        toast.error('Failed to load item');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate, toast]);

  const getPlaceholderImage = (category) => {
    const placeholders = {
      'Tech': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
      'Electronics': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop',
      'Tools': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&h=600&fit=crop',
      'Fashion': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-bc?w=800&h=600&fit=crop',
      'Party Supplies': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
      'Academic': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      'Transportation': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'Outdoor': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop',
      'Music': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop',
      'Wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
    };
    return placeholders[category] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop';
  };

  const calculatePrice = () => {
    if (!item) return { total: 0, days: 0, platformFee: 0, ownerEarns: 0 };
    const days = Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)));
    const total = days * item.price_day;
    const platformFee = total * 0.15;
    const ownerEarns = total - platformFee;
    return { total, days, platformFee, ownerEarns };
  };

  const handleRentalRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await rentalsApi.create({
        item_id: parseInt(id),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        notes
      });
      toast.success('Rental request sent! The owner will review your request.');
      setShowRentalModal(false);
      navigate('/my-rentals');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit rental request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await messagesApi.send({
        receiver_id: item.owner.id,
        content: message
      });
      toast.success('Message sent!');
      setShowMessageModal(false);
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-princeton-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!item) return null;

  const images = JSON.parse(item.images || '[]');
  const displayImage = images[activeImage]?.startsWith('http')
    ? images[activeImage]
    : getPlaceholderImage(item.category);
  const pricing = calculatePrice();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/browse" className="flex items-center gap-2 text-gray-600 hover:text-princeton-orange transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Back to browse
          </Link>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={displayImage}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = getPlaceholderImage(item.category);
                }}
              />
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-3 rounded-full text-lg font-semibold">
                    Currently Rented
                  </span>
                </div>
              )}
              {/* Image navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeImage ? 'border-princeton-orange' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getPlaceholderImage(item.category)}
                      alt={`${item.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item details */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {/* Category badge */}
              <span className="inline-block px-3 py-1 bg-princeton-orange/10 text-princeton-orange text-sm font-medium rounded-full mb-4">
                {item.category}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {item.title}
              </h1>

              {/* Rating and reviews */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{item.rating}</span>
                  <span className="text-gray-500">({item.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {item.price_hour && (
                    <div>
                      <div className="text-2xl font-bold text-princeton-orange">${item.price_hour}</div>
                      <div className="text-sm text-gray-500">per hour</div>
                    </div>
                  )}
                  <div>
                    <div className="text-2xl font-bold text-princeton-orange">${item.price_day}</div>
                    <div className="text-sm text-gray-500">per day</div>
                  </div>
                  {item.price_week && (
                    <div>
                      <div className="text-2xl font-bold text-princeton-orange">${item.price_week}</div>
                      <div className="text-sm text-gray-500">per week</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {item.is_available ? (
                <div className="space-y-3">
                  {user?.id !== item.owner_id && (
                    <button
                      onClick={() => setShowRentalModal(true)}
                      className="w-full btn-primary text-lg py-3"
                    >
                      Request to Rent
                    </button>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMessageModal(true)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Message Owner
                    </button>
                    <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-yellow-800 font-medium">This item is currently rented</p>
                  <p className="text-yellow-600 text-sm mt-1">Check back soon or message the owner</p>
                </div>
              )}

              {/* Insurance badge */}
              <div className="flex items-center gap-3 mt-6 p-4 bg-green-50 rounded-xl">
                <Shield className="w-10 h-10 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Protected by $2,000 Insurance</p>
                  <p className="text-sm text-green-600">Coverage against damage and loss</p>
                </div>
              </div>
            </div>

            {/* Owner card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Listed by</h3>
              <Link to={`/profile/${item.owner.id}`} className="flex items-center gap-4 group">
                <div className="w-14 h-14 bg-princeton-orange rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {item.owner.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 group-hover:text-princeton-orange transition-colors">
                      {item.owner.full_name}
                    </p>
                    {item.owner.verification_badge && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {item.owner.rating}
                    </span>
                    <span>{item.owner.residence}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-princeton-orange transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About this item</h2>
          <p className="text-gray-600 whitespace-pre-line">{item.description}</p>

          <div className="grid sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Condition</p>
              <p className="font-semibold text-gray-900">{item.condition || 'Good'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Security Deposit</p>
              <p className="font-semibold text-gray-900">${item.deposit || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Rentals</p>
              <p className="font-semibold text-gray-900">{item.total_rentals} times</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Modal */}
      {showRentalModal && (
        <div className="modal-overlay" onClick={() => setShowRentalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Request to Rent</h2>
              <p className="text-gray-600">{item.title}</p>
            </div>

            <form onSubmit={handleRentalRequest} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Owner (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Introduce yourself and explain what you need the item for..."
                  className="input-field resize-none"
                />
              </div>

              {/* Price breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>${item.price_day} x {pricing.days} day{pricing.days > 1 ? 's' : ''}</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform fee (15%)</span>
                  <span>${pricing.platformFee.toFixed(2)}</span>
                </div>
                {item.deposit > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Security deposit (refundable)</span>
                    <span>${item.deposit}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>${(pricing.total + (item.deposit || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRentalModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Message {item.owner.full_name}</h2>
            </div>

            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={`Hi ${item.owner.full_name}, I'm interested in your ${item.title}...`}
                className="input-field resize-none"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
