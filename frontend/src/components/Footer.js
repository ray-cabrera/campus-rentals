import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, MapPin, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-princeton-orange rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Campus<span className="text-princeton-orange">Rentals</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              The peer-to-peer marketplace for college students. Share more, spend less.
              Rent anything from cameras to formal wear from fellow students on your campus.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-princeton-orange" />
                <span>Princeton University</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-princeton-orange" />
                <span>$2,000 Insurance</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="hover:text-princeton-orange transition-colors">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Electronics" className="hover:text-princeton-orange transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Fashion" className="hover:text-princeton-orange transition-colors">
                  Formal Wear
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Sports" className="hover:text-princeton-orange transition-colors">
                  Sports Equipment
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-princeton-orange transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-princeton-orange transition-colors">
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-princeton-orange transition-colors">
                  Insurance Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-princeton-orange transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Campus Rentals. Built with love for Princeton students.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
