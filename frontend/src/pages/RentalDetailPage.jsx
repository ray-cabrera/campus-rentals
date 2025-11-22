import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentalsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { CheckCircle, XCircle, QrCode, MapPin, DollarSign, Calendar, Shield } from 'lucide-react';

const RentalDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRental();
  }, [id]);

  const fetchRental = async () => {
    try {
      const response = await rentalsAPI.getById(id);
      setRental(response.data);
    } catch (error) {
      console.error('Failed to fetch rental:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await rentalsAPI.approve(rental.id);
      await fetchRental();
    } catch (error) {
      console.error('Failed to approve rental:', error);
      alert('Failed to approve rental');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePickup = async () => {
    setActionLoading(true);
    try {
      await rentalsAPI.markPickup(rental.id, {});
      await fetchRental();
    } catch (error) {
      console.error('Failed to mark pickup:', error);
      alert('Failed to mark pickup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    setActionLoading(true);
    try {
      await rentalsAPI.markReturn(rental.id, {});
      await fetchRental();
      alert('Rental completed! Earnings have been added to your account.');
    } catch (error) {
      console.error('Failed to mark return:', error);
      alert('Failed to mark return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this rental?')) return;

    setActionLoading(true);
    try {
      await rentalsAPI.cancel(rental.id);
      await fetchRental();
    } catch (error) {
      console.error('Failed to cancel rental:', error);
      alert('Failed to cancel rental');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      approved: 'blue',
      active: 'green',
      completed: 'gray',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Rental not found</p>
      </div>
    );
  }

  const isOwner = rental.owner_id === user.id;
  const statusColor = getStatusColor(rental.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Rental #{rental.id}</h1>
          <span className={`badge badge-${statusColor === 'yellow' ? 'warning' : statusColor === 'blue' ? 'info' : statusColor === 'green' ? 'success' : 'danger'} text-lg px-4 py-2`}>
            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600">
          {isOwner ? 'Renting out to' : 'Renting from'} {isOwner ? rental.renter?.full_name : rental.owner?.full_name}
        </p>
      </div>

      {/* Rental Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Rental Information</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-gray-600">Rental Period</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(rental.start_date), 'MMM dd, yyyy')} - {format(new Date(rental.end_date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="text-gray-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="font-medium text-gray-900">${rental.total_cost.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="text-gray-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-gray-600">Security Deposit</p>
                <p className="font-medium text-gray-900">${rental.security_deposit.toFixed(2)} (refundable)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Financial Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rental Fee</span>
              <span className="font-medium">${rental.total_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee (15%)</span>
              <span className="font-medium">${rental.platform_fee.toFixed(2)}</span>
            </div>
            {isOwner && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">You Earn</span>
                <span className="font-bold text-green-600">${rental.owner_earnings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total {isOwner ? 'Renter' : 'You'} Pays</span>
              <span className="font-bold text-primary-600">${(rental.total_cost + rental.security_deposit).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes */}
      {(rental.status === 'approved' || rental.status === 'active') && rental.pickup_qr_code && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <QrCode className="text-primary-600" size={24} />
            Verification QR Codes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-3">Pickup QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={rental.pickup_qr_code} alt="Pickup QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 mt-2">Scan this code at pickup</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-3">Return QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={rental.return_qr_code} alt="Return QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 mt-2">Scan this code at return</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Timeline</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={16} />
              </div>
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            </div>
            <div className="pb-4">
              <p className="font-medium text-gray-900">Request Created</p>
              <p className="text-sm text-gray-600">{format(new Date(rental.created_at), 'MMM dd, yyyy h:mm a')}</p>
            </div>
          </div>

          {rental.approved_at && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={16} />
                </div>
                {rental.picked_up_at && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
              </div>
              <div className="pb-4">
                <p className="font-medium text-gray-900">Approved by Owner</p>
                <p className="text-sm text-gray-600">{format(new Date(rental.approved_at), 'MMM dd, yyyy h:mm a')}</p>
              </div>
            </div>
          )}

          {rental.picked_up_at && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={16} />
                </div>
                {rental.returned_at && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
              </div>
              <div className="pb-4">
                <p className="font-medium text-gray-900">Item Picked Up</p>
                <p className="text-sm text-gray-600">{format(new Date(rental.picked_up_at), 'MMM dd, yyyy h:mm a')}</p>
              </div>
            </div>
          )}

          {rental.returned_at && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Item Returned</p>
                <p className="text-sm text-gray-600">{format(new Date(rental.returned_at), 'MMM dd, yyyy h:mm a')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {/* Owner Actions */}
          {isOwner && rental.status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Approve Rental
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="btn-outline flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle size={18} />
                Decline
              </button>
            </>
          )}

          {/* Renter Actions */}
          {!isOwner && rental.status === 'approved' && (
            <button
              onClick={handlePickup}
              disabled={actionLoading}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Confirm Pickup
            </button>
          )}

          {/* Return Actions */}
          {rental.status === 'active' && (
            <button
              onClick={handleReturn}
              disabled={actionLoading}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Confirm Return
            </button>
          )}

          {/* Cancel */}
          {(rental.status === 'pending' || rental.status === 'approved') && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="btn-outline flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
            >
              <XCircle size={18} />
              Cancel Rental
            </button>
          )}

          {/* View Messages */}
          <button
            onClick={() => navigate('/messages')}
            className="btn-outline"
          >
            View Messages
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalDetailPage;
