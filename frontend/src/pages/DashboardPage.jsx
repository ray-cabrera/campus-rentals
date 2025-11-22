import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, rentalsAPI, itemsAPI } from '../utils/api';
import { DollarSign, Package, ShoppingBag, Clock, TrendingUp, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [myRentals, setMyRentals] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, myRentalsRes, itemsRes, pendingRes] = await Promise.all([
        dashboardAPI.getStats(),
        rentalsAPI.getAll({ as_owner: false }),
        itemsAPI.getMyItems(),
        rentalsAPI.getAll({ as_owner: true, status: 'pending' }),
      ]);

      setStats(statsRes.data);
      setMyRentals(myRentalsRes.data);
      setMyItems(itemsRes.data);
      setPendingRequests(pendingRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { className: 'badge-warning', label: 'Pending' },
      approved: { className: 'badge-info', label: 'Approved' },
      active: { className: 'badge-success', label: 'Active' },
      completed: { className: 'badge badge-gray-500', label: 'Completed' },
      cancelled: { className: 'badge-danger', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your rentals and track your earnings</p>
        </div>
        <Link to="/add-item" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          List New Item
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            ${stats?.total_earnings?.toFixed(2) || '0.00'}
          </h3>
          <p className="text-sm text-gray-600">Total Earnings</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp size={16} />
            <span>${stats?.monthly_earnings?.toFixed(2) || '0.00'} this month</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.items_listed || 0}</h3>
          <p className="text-sm text-gray-600">Items Listed</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.active_rentals || 0}</h3>
          <p className="text-sm text-gray-600">Active Rentals</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats?.pending_requests || 0}</h3>
          <p className="text-sm text-gray-600">Pending Requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'requests'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('myitems')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'myitems'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Items ({myItems.length})
          </button>
          <button
            onClick={() => setActiveTab('borrowing')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'borrowing'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Rentals ({myRentals.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Earnings Chart Placeholder */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Overview</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-primary-600">
                  ${stats?.weekly_earnings?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-primary-600">
                  ${stats?.monthly_earnings?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">All Time</p>
                <p className="text-2xl font-bold text-primary-600">
                  ${stats?.total_earnings?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Rentals</h2>
            {myRentals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No rentals yet</p>
            ) : (
              <div className="space-y-3">
                {myRentals.slice(0, 5).map((rental) => (
                  <Link
                    key={rental.id}
                    to={`/rentals/${rental.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Rental #{rental.id}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(rental.start_date), 'MMM dd')} - {format(new Date(rental.end_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary-600">${rental.total_cost}</span>
                      {getStatusBadge(rental.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="card p-12 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending requests</p>
            </div>
          ) : (
            pendingRequests.map((rental) => (
              <Link key={rental.id} to={`/rentals/${rental.id}`} className="card p-6 hover:shadow-md transition-shadow block">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">Rental Request #{rental.id}</h3>
                      {getStatusBadge(rental.status)}
                    </div>
                    <p className="text-gray-600 mb-2">
                      {format(new Date(rental.start_date), 'MMM dd')} - {format(new Date(rental.end_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Requested {format(new Date(rental.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">${rental.total_cost}</p>
                    <p className="text-sm text-gray-600">You earn ${rental.owner_earnings}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'myitems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myItems.map((item) => (
            <div key={item.id} className="card">
              <div className="relative">
                <img
                  src={JSON.parse(item.images || '["https://via.placeholder.com/400x300"]')[0]}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <span className={`badge absolute top-2 right-2 ${item.is_available ? 'badge-success' : 'badge-danger'}`}>
                  {item.is_available ? 'Available' : 'Rented'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-primary-600">${item.daily_rate}/day</span>
                  <span className="text-sm text-gray-500">{item.total_rentals} rentals</span>
                </div>
                <Link to={`/items/${item.id}`} className="btn-outline w-full flex items-center justify-center gap-2">
                  <Eye size={18} />
                  View Details
                </Link>
              </div>
            </div>
          ))}
          {myItems.length === 0 && (
            <div className="col-span-full card p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't listed any items yet</p>
              <Link to="/add-item" className="btn-primary inline-flex items-center gap-2">
                <Plus size={18} />
                List Your First Item
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'borrowing' && (
        <div className="space-y-4">
          {myRentals.length === 0 ? (
            <div className="card p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't rented anything yet</p>
              <Link to="/browse" className="btn-primary">Browse Items</Link>
            </div>
          ) : (
            myRentals.map((rental) => (
              <Link key={rental.id} to={`/rentals/${rental.id}`} className="card p-6 hover:shadow-md transition-shadow block">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">Rental #{rental.id}</h3>
                      {getStatusBadge(rental.status)}
                    </div>
                    <p className="text-gray-600 mb-2">
                      {format(new Date(rental.start_date), 'MMM dd')} - {format(new Date(rental.end_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">${rental.total_cost}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
