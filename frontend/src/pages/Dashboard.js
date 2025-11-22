import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboard as dashboardApi, items as itemsApi } from '../utils/api';
import {
  DollarSign,
  Package,
  TrendingUp,
  Star,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          dashboardApi.getStats(),
          itemsApi.list({ owner_id: user?.id })
        ]);
        setStats(statsRes.data);
        // Filter to only show user's items
        setMyItems(itemsRes.data.filter(item => item.owner.id === user?.id).slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-princeton-orange border-t-transparent"></div>
      </div>
    );
  }

  const earnings = stats?.earnings || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your rentals</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Earnings</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">${earnings.total_earnings?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-green-600 mt-1">+${earnings.this_month?.toFixed(2) || '0'} this month</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Active Rentals</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{earnings.active_rentals || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{earnings.completed_rentals || 0} completed</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Items Listed</span>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{earnings.items_listed || 0}</p>
            <p className="text-sm text-gray-500 mt-1">${earnings.pending_earnings?.toFixed(2) || '0'} pending</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Your Rating</span>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{earnings.average_rating?.toFixed(1) || '5.0'}</p>
            <p className="text-sm text-gray-500 mt-1">{user?.total_reviews || 0} reviews</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active rentals */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Active Rentals</h2>
                <Link to="/my-rentals" className="text-princeton-orange hover:text-princeton-orange-dark font-medium text-sm flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {stats?.active_rentals?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {stats.active_rentals.slice(0, 3).map((rental) => (
                    <div key={rental.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                          <img
                            src={`https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop`}
                            alt={rental.item?.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{rental.item?.title}</h3>
                          <p className="text-sm text-gray-500">
                            Rented to {rental.renter?.full_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`badge ${
                              rental.status === 'active' ? 'badge-green' :
                              rental.status === 'pending' ? 'badge-orange' :
                              'badge-blue'
                            }`}>
                              {rental.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              ${rental.owner_earnings?.toFixed(2)} earnings
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/my-rentals`}
                          className="btn-secondary text-sm"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">No active rentals</h3>
                  <p className="text-gray-500 mb-4">Start by listing an item to rent out</p>
                  <Link to="/add-item" className="btn-primary">
                    List Your First Item
                  </Link>
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                <Link to="/earnings" className="text-princeton-orange hover:text-princeton-orange-dark font-medium text-sm flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {stats?.recent_transactions?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {stats.recent_transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'earning' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'earning' ? (
                            <DollarSign className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowRight className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaction.type === 'earning' ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {transaction.type === 'earning' ? '+' : ''}${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No transactions yet
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/add-item"
                  className="flex items-center gap-3 p-3 bg-princeton-orange/10 hover:bg-princeton-orange/20 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-princeton-orange rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">List New Item</p>
                    <p className="text-sm text-gray-500">Start earning today</p>
                  </div>
                </Link>
                <Link
                  to="/browse"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Browse Items</p>
                    <p className="text-sm text-gray-500">Find what you need</p>
                  </div>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Messages</p>
                    <p className="text-sm text-gray-500">Chat with renters</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* My items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">My Items</h2>
                <Link to={`/profile/${user?.id}`} className="text-sm text-princeton-orange hover:text-princeton-orange-dark">
                  View All
                </Link>
              </div>

              {myItems.length > 0 ? (
                <div className="space-y-3">
                  {myItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/items/${item.id}`}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&h=100&fit=crop`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-sm text-gray-500">${item.price_day}/day</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No items listed yet
                </p>
              )}
            </div>

            {/* Tips card */}
            <div className="bg-gradient-to-br from-princeton-orange to-orange-500 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
              <p className="text-orange-100 text-sm mb-4">
                Items with clear photos and detailed descriptions get 3x more rental requests!
              </p>
              <Link
                to="/add-item"
                className="inline-flex items-center gap-2 bg-white text-princeton-orange px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors"
              >
                List an Item <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
