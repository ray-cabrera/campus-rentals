import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, rentalsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MapPin, Star, Shield, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const ItemDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await itemsAPI.getById(id);
      setItem(response.data);
    } catch (error) {
      console.error('Failed to fetch item:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (imagesJson) => {
    try {
      const images = JSON.parse(imagesJson);
      return images;
    } catch {
      return ['https://via.placeholder.com/800x600?text=No+Image'];
    }
  };

  const calculateCost = () => {
    const [startDate, endDate] = dateRange;
    const days = differenceInDays(endDate, startDate) || 1;

    if (days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return (weeks * item.weekly_rate) + (remainingDays * item.daily_rate);
    }
    return days * item.daily_rate;
  };

  const calculatePlatformFee = () => {
    return calculateCost() * 0.15;
  };

  const calculateTotal = () => {
    return calculateCost() + item.security_deposit;
  };

  const handleRentalRequest = async () => {
    setRentalLoading(true);
    setError('');

    try {
      const [startDate, endDate] = dateRange;
      await rentalsAPI.create({
        item_id: parseInt(id),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create rental request');
    } finally {
      setRentalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Item not found</p>
      </div>
    );
  }

  const images = parseImages(item.images);
  const isOwnItem = user?.id === item.owner_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="card overflow-hidden">
            <img
              src={images[0]}
              alt={item.title}
              className="w-full h-96 object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.slice(1, 5).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${item.title} ${idx + 2}`}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
              <span className={`badge ${item.is_available ? 'badge-success' : 'badge-danger'}`}>
                {item.is_available ? 'Available' : 'Rented'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin size={18} />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{item.rating.toFixed(1)}</span>
                <span className="text-sm">({item.total_ratings} ratings)</span>
              </div>
            </div>
            <span className="badge bg-primary-600 text-white">{item.category}</span>
          </div>

          {/* Pricing */}
          <div className="card p-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-primary-600">${item.daily_rate}</span>
              <span className="text-gray-600">/ day</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Weekly rate: ${item.weekly_rate}/week</p>
              <p>Security deposit: ${item.security_deposit}</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Shield className="text-green-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">${item.insurance_coverage}</p>
                <p className="text-xs text-gray-600">Insurance Coverage</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="text-blue-600" size={24} />
              <div>
                <p className="font-medium text-gray-900">{item.total_rentals}</p>
                <p className="text-xs text-gray-600">Times Rented</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
          </div>

          {/* Rental Form */}
          {!isOwnItem && item.is_available && (
            <div className="card p-6">
              {!showRentalForm ? (
                <button
                  onClick={() => setShowRentalForm(true)}
                  className="w-full btn-primary"
                >
                  Request to Rent
                </button>
              ) : success ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                  <p className="text-gray-600">
                    The owner will review your request and respond soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Select Rental Dates</h3>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <Calendar
                    onChange={setDateRange}
                    value={dateRange}
                    selectRange={true}
                    minDate={new Date()}
                    className="w-full border rounded-lg"
                  />

                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-medium">{format(dateRange[0], 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span className="font-medium">{format(dateRange[1], 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{differenceInDays(dateRange[1], dateRange[0]) || 1} days</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span>Rental Cost:</span>
                        <span className="font-medium">${calculateCost().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Platform Fee (15%):</span>
                        <span>${calculatePlatformFee().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Deposit:</span>
                        <span className="font-medium">${item.security_deposit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-primary-600 mt-2 pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRentalForm(false)}
                      className="flex-1 btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRentalRequest}
                      disabled={rentalLoading}
                      className="flex-1 btn-primary"
                    >
                      {rentalLoading ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isOwnItem && (
            <div className="card p-6 bg-blue-50 border-blue-200">
              <p className="text-blue-800 font-medium">This is your item</p>
            </div>
          )}

          {!item.is_available && !isOwnItem && (
            <div className="card p-6 bg-gray-50">
              <p className="text-gray-600 text-center">This item is currently rented</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
