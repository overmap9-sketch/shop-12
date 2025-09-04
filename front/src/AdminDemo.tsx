import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Shield, BarChart3, Users, ShoppingCart, Settings } from 'lucide-react';

export function AdminDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              E-Commerce Admin Panel
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive admin dashboard for managing your e-commerce platform with product management, user administration, order processing, and analytics.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Product Management</h3>
              </div>
              <p className="text-gray-600">
                Complete CRUD operations for products with image management, categories, subcategories, pricing, and inventory tracking.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">User Management</h3>
              </div>
              <p className="text-gray-600">
                Manage customer accounts, roles, permissions, and user analytics with comprehensive filtering and search capabilities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Order Processing</h3>
              </div>
              <p className="text-gray-600">
                Track orders, update status, manage fulfillment, and handle customer communications with real-time updates.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
              </div>
              <p className="text-gray-600">
                Sales analytics, performance metrics, user insights, and comprehensive reporting with visual charts and graphs.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">Category Management</h3>
              </div>
              <p className="text-gray-600">
                Hierarchical category and subcategory management with drag-and-drop organization and nested structures.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">System Settings</h3>
              </div>
              <p className="text-gray-600">
                Configure system settings, manage admin accounts, set permissions, and control platform-wide configurations.
              </p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-white rounded-xl p-8 shadow-sm border mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Login</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Email:</p>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">admin@example.com</code>
                  <p className="text-sm text-gray-600 mb-2 mt-3">Password:</p>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">admin123</code>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features Included</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Product CRUD with image management
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Category & subcategory hierarchy
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    User management & roles
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Order processing & tracking
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Analytics & reporting
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Responsive design
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shield className="w-5 h-5 mr-2" />
                Access Admin Panel
              </Link>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Package className="w-5 h-5 mr-2" />
                View Public Store
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Full-featured admin panel with authentication, authorization, and comprehensive management tools
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
