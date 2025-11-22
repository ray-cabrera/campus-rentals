import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../utils/api';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

const CATEGORIES = [
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

const PRINCETON_LOCATIONS = [
  'Butler College',
  'First Campus Center',
  'Forbes College',
  'Mathey College',
  'Rockefeller College',
  'Whitman College',
  'Wilson College',
  'Yeh College',
  'Firestone Library',
  'Frist Campus Center',
  'E-Quad Engineering',
];

const AddItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    daily_rate: '',
    weekly_rate: '',
    security_deposit: '',
    location: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    // Auto-calculate weekly rate
    if (name === 'daily_rate' && value) {
      const weeklyRate = (parseFloat(value) * 6).toFixed(2); // 20% discount for weekly
      setFormData(prev => ({ ...prev, daily_rate: value, weekly_rate: weeklyRate }));
    }

    // Auto-calculate security deposit
    if (name === 'daily_rate' && value) {
      const deposit = (parseFloat(value) * 10).toFixed(2); // 10x daily rate
      setFormData(prev => ({ ...prev, security_deposit: deposit }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.daily_rate) <= 0) {
      setError('Daily rate must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      // Create placeholder image
      const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' font-family='sans-serif'%3E" + encodeURIComponent(formData.title) + "%3C/text%3E%3C/svg%3E";

      const itemData = {
        ...formData,
        daily_rate: parseFloat(formData.daily_rate),
        weekly_rate: parseFloat(formData.weekly_rate),
        security_deposit: parseFloat(formData.security_deposit),
        images: JSON.stringify([placeholderImage]),
      };

      const response = await itemsAPI.create(itemData);
      navigate(`/items/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = () => {
    setFormData({
      title: 'Sony A7 III Mirrorless Camera',
      description: 'Professional full-frame mirrorless camera with 24.2MP sensor. Perfect for photography projects, events, or personal use. Includes battery, charger, and camera strap. Great condition, well-maintained.',
      category: 'Electronics',
      daily_rate: '10',
      weekly_rate: '60',
      security_deposit: '100',
      location: 'Butler College',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">List a New Item</h1>
        <p className="text-gray-600">Share your unused items and start earning</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Item Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Canon DSLR Camera, Power Drill, Formal Dress"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="input-field"
              placeholder="Describe your item, its condition, and what's included..."
            />
          </div>

          {/* Category & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select location</option>
                {PRINCETON_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="daily_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Rate ($) *
                </label>
                <input
                  type="number"
                  id="daily_rate"
                  name="daily_rate"
                  value={formData.daily_rate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="10.00"
                />
              </div>

              <div>
                <label htmlFor="weekly_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Weekly Rate ($) *
                </label>
                <input
                  type="number"
                  id="weekly_rate"
                  name="weekly_rate"
                  value={formData.weekly_rate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="60.00"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-suggested</p>
              </div>

              <div>
                <label htmlFor="security_deposit" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit ($) *
                </label>
                <input
                  type="number"
                  id="security_deposit"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="100.00"
                />
                <p className="text-xs text-gray-500 mt-1">Refundable</p>
              </div>
            </div>
          </div>

          {/* Insurance Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Every rental includes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>$2,000 insurance coverage</li>
                  <li>Secure payment processing</li>
                  <li>QR code verification system</li>
                  <li>85% of rental fee goes to you (15% platform fee)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={quickFill}
              className="flex-1 btn-outline"
            >
              Quick Demo Fill
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Creating...' : 'List Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemPage;
