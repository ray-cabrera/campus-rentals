import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { users as usersApi, items as itemsApi } from '../utils/api';
import ItemCard from '../components/ItemCard';
import {
  Star,
  MapPin,
  CheckCircle,
  Calendar,
  MessageSquare,
  Package,
  Award
} from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');

  const isOwnProfile = currentUser?.id === parseInt(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, itemsRes, reviewsRes] = await Promise.all([
          usersApi.get(id),
          usersApi.getItems(id),
          usersApi.getReviews(id)
        ]);
        setUser(userRes.data);
        setUserItems(itemsRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-princeton-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-princeton-orange to-orange-400" />

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 bg-princeton-orange rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                    {user.verification_badge && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    {user.residence && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {user.residence}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {format(new Date(user.created_at), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex gap-3">
                {!isOwnProfile && (
                  <Link
                    to={`/messages/${user.id}`}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Link>
                )}
                {isOwnProfile && (
                  <Link to="/settings" className="btn-primary">
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="mt-4 text-gray-600">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  {user.rating.toFixed(1)}
                </div>
                <p className="text-sm text-gray-500">{user.total_reviews} reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{userItems.length}</p>
                <p className="text-sm text-gray-500">Items Listed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.items_rented_out}</p>
                <p className="text-sm text-gray-500">Rentals Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${user.total_earnings.toFixed(0)}</p>
                <p className="text-sm text-gray-500">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'items'
                ? 'bg-princeton-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Listed Items ({userItems.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-princeton-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'items' ? (
          userItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items listed</h3>
              <p className="text-gray-500">
                {isOwnProfile ? "You haven't listed any items yet" : "This user hasn't listed any items yet"}
              </p>
              {isOwnProfile && (
                <Link to="/add-item" className="btn-primary mt-4 inline-block">
                  List Your First Item
                </Link>
              )}
            </div>
          )
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-princeton-orange rounded-full flex items-center justify-center text-white font-semibold">
                    {review.reviewer.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link to={`/profile/${review.reviewer.id}`} className="font-semibold text-gray-900 hover:text-princeton-orange">
                          {review.reviewer.full_name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-gray-600">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">
              {isOwnProfile ? "You haven't received any reviews yet" : "This user hasn't received any reviews yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
