import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock
} from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  empNo: string;
  phone: string;
}

interface Delivery {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: string;
  shift: string;
  items: any[];
  createdAt: string;
}

const DriverApp: React.FC = () => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ empNo: '', phone: '' });
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentStatus, setCommentStatus] = useState('');
  const [comment, setComment] = useState('');

  // Login function
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://172.20.10.2:3001/api/driver/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doNumber: loginData.empNo, phone: loginData.phone }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDriver(data.driver);
        setShowLogin(false);
        loadDeliveries(data.driver.id);
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show comment modal for status updates that require comments
  const showCommentModalForStatus = (deliveryId: string, status: string) => {
    setSelectedDelivery(deliveries.find(d => d.id === deliveryId) || null);
    setCommentStatus(status);
    setComment('');
    setShowCommentModal(true);
  };

  // Update delivery status with comment
  const updateDeliveryStatusWithComment = async () => {
    if (!selectedDelivery || !comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/driver/deliveries/${selectedDelivery.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: commentStatus, 
          reason: comment,
          location: 'GPS Location Captured', // In real app, get actual GPS
          photo: 'Photo Captured' // In real app, capture actual photo
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh deliveries
        if (driver) {
          loadDeliveries(driver.id);
        }
        setShowCommentModal(false);
        setComment('');
        setCommentStatus('');
        setSelectedDelivery(null);
        alert('Delivery status updated successfully!');
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load driver's deliveries
  const loadDeliveries = async (driverId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/driver/deliveries/${driverId}`);
      const data = await response.json();
      
      if (data.success) {
        setDeliveries(data.deliveries);
      }
    } catch (error) {
      console.error('Load deliveries error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (deliveryId: string, status: string, reason?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/driver/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status, 
          reason,
          location: 'GPS Location Captured', // In real app, get actual GPS
          photo: 'Photo Captured' // In real app, capture actual photo
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh deliveries
        if (driver) {
          loadDeliveries(driver.id);
        }
        setSelectedDelivery(null);
        alert('Delivery status updated successfully!');
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'Not Delivered': return 'text-red-600 bg-red-100';
      case 'Postponed': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="h-4 w-4" />;
      case 'Not Delivered': return <XCircle className="h-4 w-4" />;
      case 'Postponed': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Driver Login</h1>
            <p className="text-gray-600">Enter your credentials to access deliveries</p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Number
              </label>
              <input
                type="text"
                value={loginData.empNo}
                onChange={(e) => setLoginData({ ...loginData, empNo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your employee number (e.g., 2554682977)"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={loginData.phone}
                onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Driver Portal</h1>
              <p className="text-gray-600">Welcome, {driver?.name}</p>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              My Deliveries ({deliveries.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading deliveries...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No deliveries assigned to you.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {delivery.customerName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {getStatusIcon(delivery.status)}
                          <span className="ml-1">{delivery.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span>Invoice: {delivery.invoiceNo}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{delivery.customerPhone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{delivery.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{delivery.shift} Shift</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedDelivery(delivery)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        View Details
                      </button>
                      
                      {delivery.status === 'Out for Delivery' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateDeliveryStatus(delivery.id, 'Delivered')}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          >
                            Delivered
                          </button>
                          <button
                            onClick={() => showCommentModalForStatus(delivery.id, 'Not Delivered')}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            Not Delivered
                          </button>
                          <button
                            onClick={() => showCommentModalForStatus(delivery.id, 'Postponed')}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                          >
                            Postpone
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Delivery Details</h3>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="ml-2 text-gray-900">{selectedDelivery.customerName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{selectedDelivery.customerPhone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="ml-2 text-gray-900">{selectedDelivery.address}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Invoice:</span>
                  <span className="ml-2 text-gray-900">{selectedDelivery.invoiceNo}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDelivery.status)}`}>
                    {getStatusIcon(selectedDelivery.status)}
                    <span className="ml-1">{selectedDelivery.status}</span>
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Shift:</span>
                  <span className="ml-2 text-gray-900">{selectedDelivery.shift}</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                {selectedDelivery.status === 'Out for Delivery' && (
                  <button
                    onClick={() => {
                      updateDeliveryStatus(selectedDelivery.id, 'Delivered');
                      setSelectedDelivery(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add Comment for {commentStatus}
                </h3>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setComment('');
                    setCommentStatus('');
                    setSelectedDelivery(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (Required)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder={`Please provide details for ${commentStatus.toLowerCase()}...`}
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCommentModal(false);
                      setComment('');
                      setCommentStatus('');
                      setSelectedDelivery(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateDeliveryStatusWithComment}
                    disabled={loading || !comment.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : `Mark as ${commentStatus}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverApp;

