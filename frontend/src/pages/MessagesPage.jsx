import React, { useState, useEffect } from 'react';
import { messagesAPI, rentalsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const MessagesPage = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    if (selectedRental) {
      fetchMessages(selectedRental.id);
    }
  }, [selectedRental]);

  const fetchRentals = async () => {
    try {
      const [asRenterRes, asOwnerRes] = await Promise.all([
        rentalsAPI.getAll({ as_owner: false }),
        rentalsAPI.getAll({ as_owner: true }),
      ]);

      const allRentals = [...asRenterRes.data, ...asOwnerRes.data];
      // Remove duplicates and filter only active conversations
      const uniqueRentals = allRentals.filter((rental, index, self) =>
        index === self.findIndex((r) => r.id === rental.id) &&
        rental.status !== 'cancelled'
      );

      setRentals(uniqueRentals);
      if (uniqueRentals.length > 0) {
        setSelectedRental(uniqueRentals[0]);
      }
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (rentalId) => {
    try {
      const response = await messagesAPI.getRentalMessages(rentalId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRental) return;

    try {
      const receiverId = selectedRental.owner_id === user.id
        ? selectedRental.renter_id
        : selectedRental.owner_id;

      await messagesAPI.send({
        rental_id: selectedRental.id,
        receiver_id: receiverId,
        message: newMessage,
      });

      setNewMessage('');
      fetchMessages(selectedRental.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h2>
          <p className="text-gray-600">Messages will appear here when you have active rentals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="card overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {rentals.map((rental) => {
                const isOwner = rental.owner_id === user.id;
                const otherUser = isOwner ? rental.renter : rental.owner;

                return (
                  <button
                    key={rental.id}
                    onClick={() => setSelectedRental(rental)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedRental?.id === rental.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-gray-900">{otherUser?.full_name || 'User'}</p>
                      <span className="badge badge-info text-xs">{rental.status}</span>
                    </div>
                    <p className="text-sm text-gray-600">Rental #{rental.id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(rental.start_date), 'MMM dd')} - {format(new Date(rental.end_date), 'MMM dd')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="card flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              {selectedRental && (
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedRental.owner_id === user.id
                      ? selectedRental.renter?.full_name
                      : selectedRental.owner?.full_name}
                  </h2>
                  <p className="text-sm text-gray-600">Rental #{selectedRental.id}</p>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMyMessage = message.sender_id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          isMyMessage
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${isMyMessage ? 'text-primary-100' : 'text-gray-500'}`}>
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input-field"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send size={18} />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
