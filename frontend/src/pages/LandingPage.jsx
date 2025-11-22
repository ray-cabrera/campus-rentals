import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Wrench, Shirt, Gamepad2, Bike, Tent, DollarSign, Shield, Clock, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Rent Anything on Campus
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Turn your unused items into income. Borrow what you need from fellow students. Save money, earn cash, and build community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Get Started Free
              </Link>
              <Link to="/browse" className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-400 transition-colors border-2 border-white">
                Browse Items
              </Link>
            </div>
            <p className="text-primary-100 mt-6 text-sm">
              Join 500+ Princeton students already earning $500+ per semester
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L1440 120L1440 0C1440 0 1080 120 720 120C360 120 0 0 0 0L0 120Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1,000+</div>
              <div className="text-gray-600">Items Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">$2000</div>
              <div className="text-gray-600">Insurance Coverage</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Rent from Every Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: Camera, name: 'Electronics', color: 'blue' },
              { icon: Wrench, name: 'Tools', color: 'gray' },
              { icon: Shirt, name: 'Fashion', color: 'pink' },
              { icon: Gamepad2, name: 'Gaming', color: 'purple' },
              { icon: Bike, name: 'Transportation', color: 'green' },
              { icon: Tent, name: 'Outdoor', color: 'teal' },
              { icon: DollarSign, name: 'Party Supplies', color: 'yellow' },
              { icon: Users, name: 'Academic', color: 'indigo' },
            ].map((category) => (
              <div key={category.name} className="card p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                <category.icon className={`w-12 h-12 mx-auto mb-3 text-${category.color}-500 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Campus Rentals?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Extra Income</h3>
              <p className="text-gray-600">
                Turn your unused camera, bike, or formal wear into steady income. Students earn $500+ per semester on average.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Protected & Insured</h3>
              <p className="text-gray-600">
                Every rental includes $2,000 insurance coverage and secure payment processing for peace of mind.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Convenient</h3>
              <p className="text-gray-600">
                Find what you need nearby on campus. QR code verification makes pickup and return seamless.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Renters */}
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-6">For Renters</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Browse & Search</h4>
                    <p className="text-gray-600">Find exactly what you need from fellow students</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Request & Pay</h4>
                    <p className="text-gray-600">Send rental request and pay securely online</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Pickup & Enjoy</h4>
                    <p className="text-gray-600">Meet on campus, scan QR code, and enjoy!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Owners */}
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-6">For Item Owners</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">List Your Item</h4>
                    <p className="text-gray-600">Add photos, set your price, and go live in minutes</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Approve Requests</h4>
                    <p className="text-gray-600">Review rental requests and approve trusted renters</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Earn Money</h4>
                    <p className="text-gray-600">Get paid automatically when rental is complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Renting?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of Princeton students saving money and earning income
          </p>
          <Link to="/signup" className="inline-block bg-white text-primary-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Sign Up with .edu Email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
