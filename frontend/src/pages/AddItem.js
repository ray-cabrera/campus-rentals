import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { items as itemsApi, utils } from '../utils/api';
import {
  Camera,
  DollarSign,
  MapPin,
  Tag,
  FileText,
  Sparkles,
  X,
  Upload,
  Info
} from 'lucide-react';

const AddItem = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pricingSuggestion, setPricingSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'Good',
    price_hour: '',
    price_day: '',
    price_week: '',
    deposit: '',
    location: '',
    images: []
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          utils.getCategories(),
          utils.getLocations()
        ]);
        setCategories(catRes.data);
        setLocations(locRes.data);
      } catch (error) {
        console.error('Failed to fetch metadata');
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchPricingSuggestion = async () => {
      if (formData.category) {
        try {
          const response = await itemsApi.getPricingSuggestion(formData.category);
          setPricingSuggestion(response.data);
        } catch (error) {
          console.error('Failed to fetch pricing suggestion');
        }
      }
    };
    fetchPricingSuggestion();
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result].slice(0, 5)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const applySuggestedPricing = () => {
    if (pricingSuggestion) {
      setFormData((prev) => ({
        ...prev,
        price_hour: pricingSuggestion.suggested_hourly || '',
        price_day: pricingSuggestion.suggested_daily,
        price_week: pricingSuggestion.suggested_weekly,
        deposit: pricingSuggestion.suggested_deposit
      }));
      toast.success('Suggested pricing applied!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.price_day) {
      toast.error('Daily price is required');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price_hour: formData.price_hour ? parseFloat(formData.price_hour) : null,
        price_day: parseFloat(formData.price_day),
        price_week: formData.price_week ? parseFloat(formData.price_week) : null,
        deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
        location: formData.location,
        images: JSON.stringify(formData.images.length > 0 ? formData.images : ['/placeholder'])
      };

      const response = await itemsApi.create(submitData);
      toast.success('Item listed successfully!');
      navigate(`/items/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoData = () => {
    setFormData({
      title: 'Sony A7 III Mirrorless Camera',
      description: 'Professional mirrorless camera perfect for photography projects, events, or content creation. Includes 28-70mm lens, extra battery, SD card, and carrying case. 4K video capable with excellent low-light performance.',
      category: 'Tech',
      condition: 'Excellent',
      price_hour: '10',
      price_day: '35',
      price_week: '150',
      deposit: '150',
      location: 'Butler College',
      images: []
    });
    toast.info('Demo data filled!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List a New Item</h1>
          <p className="text-gray-600 mt-1">Share your stuff and start earning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-princeton-orange" />
              Photos
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.images.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-princeton-orange hover:bg-orange-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3">Upload up to 5 photos. First photo will be the cover.</p>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-princeton-orange" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Canon EOS 80D DSLR Camera"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your item, its condition, what's included, and any usage tips..."
                  className="input-field resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="input-field pl-10 appearance-none"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="input-field appearance-none"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field pl-10 appearance-none"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-princeton-orange" />
                Pricing
              </h2>

              {pricingSuggestion && (
                <button
                  type="button"
                  onClick={applySuggestedPricing}
                  className="flex items-center gap-2 text-sm text-princeton-orange hover:text-princeton-orange-dark font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Use Suggested Pricing
                </button>
              )}
            </div>

            {pricingSuggestion && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-princeton-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Suggested pricing for {formData.category}</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Hourly: ${pricingSuggestion.suggested_hourly || 'N/A'} |
                      Daily: ${pricingSuggestion.suggested_daily} |
                      Weekly: ${pricingSuggestion.suggested_weekly} |
                      Deposit: ${pricingSuggestion.suggested_deposit}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price_hour"
                    value={formData.price_hour}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="input-field pl-8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Rate *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price_day"
                    value={formData.price_day}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="input-field pl-8"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price_week"
                    value={formData.price_week}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="input-field pl-8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Platform fee: 15% of rental price. You'll receive 85% of the total.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={fillDemoData}
              className="btn-secondary"
            >
              Fill Demo Data
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-3 text-lg disabled:opacity-50"
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
