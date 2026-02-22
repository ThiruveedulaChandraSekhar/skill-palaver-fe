/**
 * Landing Page
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../api';

export default function LandingPage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const response = await publicAPI.getInfo();
      setInfo(response.data);
    } catch (error) {
      console.error('Error loading info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartWatch Analytics
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            AI-Powered Sales Forecast for
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Smartwatch Companies
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Transform your product data into actionable insights with machine learning.
            Track sales, predict trends, and optimize your smartwatch business.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-50 transition font-semibold text-lg border-2 border-gray-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Stats */}
        {!loading && info && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {info.model_accuracy}%
              </div>
              <div className="text-gray-600 font-medium">Model Accuracy</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {info.total_companies}+
              </div>
              <div className="text-gray-600 font-medium">Active Companies</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {new Date(info.last_updated).toLocaleDateString()}
              </div>
              <div className="text-gray-600 font-medium">Last Updated</div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Powerful Features for Your Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Real-time Analytics',
                description: 'Track sales, revenue, and performance metrics in real-time',
                icon: '📊'
              },
              {
                title: 'AI Predictions',
                description: 'Get accurate sales forecasts powered by machine learning',
                icon: '🤖'
              },
              {
                title: 'Custom Datasets',
                description: 'Upload and manage your product data easily with CSV',
                icon: '📁'
              },
              {
                title: 'Multi-region Support',
                description: 'Analyze performance across different regions and markets',
                icon: '🌍'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="mt-24 bg-white rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
            About Our Platform
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto leading-relaxed">
            Our platform empowers smartwatch companies with advanced analytics and AI-powered insights. 
            Whether you're a startup or an established brand, we help you understand your market, 
            optimize your products, and predict future trends. With role-based access for admins and 
            companies, secure data management, and comprehensive visualization tools, we make data-driven 
            decision making accessible to everyone.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of companies already using our platform
          </p>
          <Link
            to="/signup"
            className="inline-block bg-blue-600 text-white px-12 py-4 rounded-xl hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            SmartWatch Analytics Platform
          </div>
          <p className="text-gray-400">
            &copy; 2026 SmartWatch Analytics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
