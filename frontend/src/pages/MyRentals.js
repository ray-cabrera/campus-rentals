import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { rentals as rentalsApi } from '../utils/api';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  QrCode,
  MessageSquare,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

const MyRentals = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('borrowing');
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, [activeTab]);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const response = await rentalsApi.list({
        as_owner: activeTab === 'lending'
      });
      setRentals(response.data);
    } catch (error) {
      toast.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (rentalId) => {
    try {
      await rentalsApi.approve(rentalId);
      toast.success('Rental approved!');
      fetchRentals();
    } catch (error) {
      toast.error('Failed to approve rental');
    }
  };

  const handleReject = async (rentalId) => {
    try {
      await rentalsApi.reject(rentalId);
      toast.success('Rental rejected');
      fetchRentals();
    } catch (error) {
      toast.error('Failed to reject rental');
    }
  };

  const handleVerifyPickup = async (rentalId) => {
    try {
      await rentalsApi.verifyPickup(rentalId);
      toast.success('Pickup verified! Rental is now active.');
      fetchRentals();
    } catch (error) {
      toast.error('Failed to verify pickup');
    }
  };

  const handleVerifyReturn = async (rentalId) => {
    try {
      await rentalsApi.verifyReturn(rentalId);
      toast.success('Return verified! Rental completed.');
      fetchRentals();
    } catch (error) {
      toast.error('Failed to verify return');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'badge-orange', icon: Clock, text: 'Pending' },
      approved: { color: 'badge-blue', icon: CheckCircle, text: 'Approved' },
      active: { color: 'badge-green', icon: Package, text: 'Active' },
      completed: { color: 'badge-gray', icon: CheckCircle, text: 'Completed' },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Rejected' },
      cancelled: { color: 'badge-gray', icon: XCircle, text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const showQR = (rental, type) => {
    setSelectedRental({ ...rental, qrType: type });
    setShowQRModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Rentals</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('borrowing')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'borrowing'
                ? 'bg-princeton-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Items I'm Borrowing
          </button>
          <button
            onClick={() => setActiveTab('lending')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'lending'
                ? 'bg-princeton-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Items I'm Lending
          </button>
        </div>

        {/* Rentals list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : rentals.length > 0 ? (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div key={rental.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Item image */}
                    <Link to={`/items/${rental.item.id}`} className="w-full sm:w-32 h-32 flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop"
                        alt={rental.item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </Link>

                    {/* Rental details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/items/${rental.item.id}`} className="font-semibold text-gray-900 hover:text-princeton-orange">
                            {rental.item.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {activeTab === 'borrowing' ? 'From' : 'To'}{' '}
                            <Link to={`/profile/${activeTab === 'borrowing' ? rental.owner.id : rental.renter.id}`} className="text-princeton-orange hover:underline">
                              {activeTab === 'borrowing' ? rental.owner.full_name : rental.renter.full_name}
                            </Link>
                          </p>
                        </div>
                        {getStatusBadge(rental.status)}
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-medium">{format(new Date(rental.start_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">End Date</p>
                          <p className="font-medium">{format(new Date(rental.end_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-medium">${rental.total_price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{activeTab === 'lending' ? 'Your Earnings' : 'Deposit'}</p>
                          <p className="font-medium text-green-600">
                            ${activeTab === 'lending' ? rental.owner_earnings.toFixed(2) : rental.deposit_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3">
                  {/* Owner actions for pending rentals */}
                  {activeTab === 'lending' && rental.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(rental.id)}
                        className="btn-primary text-sm"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleReject(rental.id)}
                        className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* QR codes for approved/active rentals */}
                  {['approved', 'active'].includes(rental.status) && (
                    <>
                      {!rental.pickup_verified && (
                        <button
                          onClick={() => showQR(rental, 'pickup')}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Pickup QR
                        </button>
                      )}
                      {rental.pickup_verified && !rental.return_verified && (
                        <button
                          onClick={() => showQR(rental, 'return')}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Return QR
                        </button>
                      )}
                    </>
                  )}

                  {/* Message button */}
                  <Link
                    to={`/messages/${activeTab === 'borrowing' ? rental.owner.id : rental.renter.id}`}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Link>

                  {/* Review button for completed rentals */}
                  {rental.status === 'completed' && (
                    <button className="btn-secondary text-sm flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rentals yet</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'borrowing'
                ? "You haven't borrowed any items yet"
                : "You haven't lent any items yet"}
            </p>
            <Link to="/browse" className="btn-primary">
              {activeTab === 'borrowing' ? 'Browse Items' : 'List an Item'}
            </Link>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedRental && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {selectedRental.qrType === 'pickup' ? 'Pickup' : 'Return'} Verification
              </h2>
              <p className="text-gray-600 mb-6">
                {selectedRental.qrType === 'pickup'
                  ? 'Scan this QR code when picking up the item'
                  : 'Scan this QR code when returning the item'}
              </p>

              {/* QR Code display */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block mb-6">
                <img
                  src={selectedRental.qrType === 'pickup' ? selectedRental.pickup_qr_code : selectedRental.return_qr_code}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (selectedRental.qrType === 'pickup') {
                      handleVerifyPickup(selectedRental.id);
                    } else {
                      handleVerifyReturn(selectedRental.id);
                    }
                    setShowQRModal(false);
                  }}
                  className="w-full btn-primary"
                >
                  Mark as {selectedRental.qrType === 'pickup' ? 'Picked Up' : 'Returned'}
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
