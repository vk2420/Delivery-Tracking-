import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Filter,
  RefreshCw,
  Search,
  Calendar,
  MapPin,
  Building,
  MessageSquare,
  RotateCcw,
  Clock,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getDeliveries, 
  getDeliveryStats, 
  updateDeliveryStatus, 
  getDrivers,
  addDeliveryRemark,
  updateRTSStatus,
  getClusterOptions,
  getConceptOptions
} from '../services/api';
import { Delivery, Driver, DeliveryStats, Remark } from '../types';

const Dashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    total: 0,
    outForDelivery: 0,
    delivered: 0,
    notDelivered: 0,
    postponed: 0,
    replacementScheduled: 0,
    onHold: 0,
    cancelled: 0,
    rts: 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [driverFilter, setDriverFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [clusterFilter, setClusterFilter] = useState<string>('');
  const [conceptFilter, setConceptFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Options for dropdowns
  const [clusterOptions, setClusterOptions] = useState<any[]>([]);
  const [conceptOptions, setConceptOptions] = useState<any[]>([]);

  // Modal states
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [showRTSModal, setShowRTSModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [remarkType, setRemarkType] = useState('General');
  const [addedBy, setAddedBy] = useState('Admin');
  const [rtsStatus, setRtsStatus] = useState('Not Applicable');
  const [rtsReason, setRtsReason] = useState('');
  const [rtsDate, setRtsDate] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deliveriesRes, statsRes, driversRes] = await Promise.all([
        getDeliveries({
          status: statusFilter || undefined,
          driverId: driverFilter || undefined,
          date: dateFilter || undefined,
          cluster: clusterFilter || undefined,
          concept: conceptFilter || undefined,
          limit: 100
        }),
        getDeliveryStats(dateFilter || undefined),
        getDrivers()
      ]);

      if (deliveriesRes.success) {
        setDeliveries(deliveriesRes.data || []);
      }
      if (statsRes.success) {
        setStats(statsRes.data || {
          total: 0,
          outForDelivery: 0,
          delivered: 0,
          notDelivered: 0,
          postponed: 0,
          replacementScheduled: 0,
          onHold: 0,
          cancelled: 0,
          rts: 0
        });
      }
      if (driversRes.success) {
        setDrivers(driversRes.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, driverFilter, dateFilter, clusterFilter, conceptFilter]);

  // Excel Export Function
  const exportToExcel = () => {
    const filteredDeliveries = deliveries.filter(delivery => {
      const matchesSearch = !searchTerm || 
        delivery.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.driverId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.driverPhone?.includes(searchTerm);
      
      const matchesStatus = !statusFilter || delivery.status === statusFilter;
      const matchesDriver = !driverFilter || delivery.driverId?._id === driverFilter;
      const matchesCluster = !clusterFilter || delivery.cluster === clusterFilter;
      const matchesConcept = !conceptFilter || delivery.concept === conceptFilter;
      
      // Fix date filtering - compare date strings properly
      let matchesDate = true;
      if (dateFilter) {
        const deliveryDate = delivery.date || delivery.createdAt;
        if (deliveryDate) {
          const deliveryDateStr = new Date(deliveryDate).toISOString().split('T')[0];
          matchesDate = deliveryDateStr === dateFilter;
        } else {
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDriver && matchesCluster && matchesConcept && matchesDate;
    });

    const exportData = filteredDeliveries.map(delivery => ({
      'DO Number': delivery.doNumber,
      'Customer Name': delivery.customerName,
      'Phone': delivery.customerPhone,
      'Address': delivery.address,
      'Driver Name': delivery.driverId?.name || delivery.driverName || 'N/A',
      'Driver Phone': delivery.driverId?.phone || delivery.driverPhone || 'N/A',
      'Status': delivery.status,
      'Date': delivery.date,
      'Cluster': delivery.cluster,
      'Concept': delivery.concept,
      'Remarks': delivery.reason || delivery.remarks || 'N/A',
      'RTS Status': delivery.rtsStatus || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deliveries');
    
    const fileName = `deliveries_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    loadData();
    loadOptions();
  }, [loadData]);

  const loadOptions = async () => {
    try {
      const [clusterRes, conceptRes] = await Promise.all([
        getClusterOptions(),
        getConceptOptions()
      ]);

      if (clusterRes.success) {
        setClusterOptions(clusterRes.data || []);
      }
      if (conceptRes.success) {
        setConceptOptions(conceptRes.data || []);
      }
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleStatusUpdate = async (deliveryId: string, status: string, reason?: string, additionalData?: any) => {
    setUpdating(deliveryId);
    try {
      const response = await updateDeliveryStatus(deliveryId, status, reason, additionalData);
      if (response.success) {
        await loadData(); // Reload data to get updated status
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert('Not Delivered to update delivery status');
    } finally {
      setUpdating(null);
    }
  };

  const handleAddRemark = async () => {
    if (!selectedDelivery || !remarkText.trim()) return;

    try {
      const response = await addDeliveryRemark(
        selectedDelivery._id,
        remarkText,
        remarkType,
        addedBy
      );
      
      if (response.success) {
        setShowRemarkModal(false);
        setRemarkText('');
        await loadData();
        alert('Remark added successfully!');
      }
    } catch (error) {
      console.error('Error adding remark:', error);
      alert('Not Delivered to add remark');
    }
  };

  const handleUpdateRTS = async () => {
    if (!selectedDelivery) return;

    try {
      const response = await updateRTSStatus(
        selectedDelivery._id,
        rtsStatus,
        rtsReason,
        rtsDate
      );
      
      if (response.success) {
        setShowRTSModal(false);
        await loadData();
        alert('RTS status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating RTS status:', error);
      alert('Not Delivered to update RTS status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800';
      case 'Not Delivered':
        return 'bg-red-100 text-red-800';
      case 'Postponed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Replacement Scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'On Hold':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'RTS':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'Out for Delivery':
        return <Truck className="h-4 w-4" />;
      case 'Not Delivered':
        return <XCircle className="h-4 w-4" />;
      case 'Postponed':
        return <Clock className="h-4 w-4" />;
      case 'Replacement Scheduled':
        return <RotateCcw className="h-4 w-4" />;
      case 'On Hold':
        return <AlertTriangle className="h-4 w-4" />;
      case 'RTS':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getRTSColor = (rtsStatus: string) => {
    switch (rtsStatus) {
      case 'Returned to Store':
        return 'bg-red-100 text-red-800';
      case 'Warehouse Received':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (delivery.customerId?.name || delivery.customerName || '').toLowerCase().includes(searchLower) ||
      (delivery.customerId?.address || delivery.address || '').toLowerCase().includes(searchLower) ||
      delivery.invoiceNo.toLowerCase().includes(searchLower) ||
      (delivery.driverId?.name || delivery.driverName || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🚚 Enhanced Delivery Dashboard</h1>
        <p className="text-gray-600">Monitor and manage delivery statuses with cluster and concept filtering</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out for Delivery</p>
              <p className="text-2xl font-bold text-blue-600">{stats.outForDelivery}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Not Delivered</p>
              <p className="text-2xl font-bold text-red-600">{stats.notDelivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Postponed</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.postponed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Not Delivered">Not Delivered</option>
            <option value="Postponed">Postponed</option>
            <option value="Replacement Scheduled">Replacement Scheduled</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="RTS">RTS</option>
          </select>

          {/* Cluster Filter */}
          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Clusters</option>
            {clusterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Concept Filter */}
          <select
            value={conceptFilter}
            onChange={(e) => setConceptFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Concepts</option>
            {conceptOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Driver Filter */}
          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Drivers</option>
            {drivers.map((driver) => (
              <option key={driver._id} value={driver._id}>
                {driver.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Deliveries ({filteredDeliveries.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading deliveries...</p>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No deliveries found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cluster/Concept
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RTS Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.customerId?.name || delivery.customerName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.customerId?.address || delivery.address || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.customerId?.phone1 || delivery.customerPhone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.driverId?.name || delivery.driverName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.driverId?.phone || delivery.driverPhone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {delivery.cluster || 'Unknown'}
                        </div>
                        <div className="flex items-center mt-1">
                          <Building className="h-4 w-4 text-gray-400 mr-1" />
                          {delivery.concept || 'Unknown'}
                        </div>
                        {delivery.deliverySource && (
                          <div className="text-xs text-gray-500 mt-1">
                            Source: {delivery.deliverySource}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1">{delivery.status}</span>
                      </span>
                      {delivery.failureReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          {delivery.failureReason}
                        </div>
                      )}
                      {delivery.crmNo && (
                        <div className="text-xs text-yellow-600 mt-1 font-medium">
                          CRM: {delivery.crmNo}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRTSColor(delivery.rtsStatus || 'Not Applicable')}`}>
                        {delivery.rtsStatus || 'Not Applicable'}
                      </span>
                      {delivery.rtsReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          {delivery.rtsReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {/* Show failure reason for Not Delivered status */}
                        {delivery.status === 'Not Delivered' && delivery.reason && (
                          <div className="text-xs bg-red-100 p-2 rounded mb-2 border-l-4 border-red-500">
                            <div className="font-medium text-red-800">Not Delivered Reason:</div>
                            <div className="text-red-700">{delivery.reason}</div>
                          </div>
                        )}
                        
                        {/* Show regular remarks - scrollable list */}
                        {delivery.remarks && delivery.remarks.length > 0 ? (
                          <div className="max-w-xs max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                            {delivery.remarks.slice().reverse().map((remark: Remark, index: number) => (
                              <div key={index} className="text-xs bg-gray-100 p-2 rounded mb-1 border-l-2 border-blue-500">
                                <div className="font-medium text-gray-800">{remark.addedBy}</div>
                                <div className="text-gray-600 mt-1">{remark.remark}</div>
                                <div className="text-gray-400 text-xs mt-1">
                                  {new Date(remark.addedAt).toLocaleString()}
                                </div>
                              </div>
                            ))}
                            <div className="text-xs text-gray-500 mt-1 sticky bottom-0 bg-white py-1">
                              Total: {delivery.remarks.length} remark{delivery.remarks.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No remarks</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {delivery.status === 'Out for Delivery' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(delivery._id, 'Delivered')}
                              disabled={updating === delivery._id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Mark as Delivered"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for failure:');
                                if (reason) {
                                  handleStatusUpdate(delivery._id, 'Not Delivered', reason);
                                }
                              }}
                              disabled={updating === delivery._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Mark as Not Delivered"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                const newDate = prompt('New delivery date (YYYY-MM-DD):');
                                if (newDate) {
                                  handleStatusUpdate(delivery._id, 'Postponed', 'Postponed as requested', { postponedDate: newDate });
                                }
                              }}
                              disabled={updating === delivery._id}
                              className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                              title="Postpone Delivery"
                            >
                              <Clock className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowRemarkModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Add Remark"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>

                        {delivery.status === 'Not Delivered' && (
                          <button
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setRtsStatus(delivery.rtsStatus || 'Not Applicable');
                              setRtsReason(delivery.rtsReason || '');
                              setRtsDate(delivery.rtsDate ? new Date(delivery.rtsDate).toISOString().split('T')[0] : '');
                              setShowRTSModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Update RTS Status"
                          >
                            <RotateCcw className="h-5 w-5" />
                          </button>
                        )}

                        {updating === delivery._id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remark Modal */}
      {showRemarkModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Add Remark</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Remark Type</label>
                <select
                  value={remarkType}
                  onChange={(e) => setRemarkType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="General">General</option>
                  <option value="Postponed">Postponed</option>
                  <option value="Not Delivered">Not Delivered</option>
                  <option value="RTS">RTS</option>
                  <option value="Replacement">Replacement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remark</label>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Enter your remark..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Added By</label>
                <input
                  type="text"
                  value={addedBy}
                  onChange={(e) => setAddedBy(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowRemarkModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRemark}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Remark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RTS Modal */}
      {showRTSModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Update RTS Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">RTS Status</label>
                <select
                  value={rtsStatus}
                  onChange={(e) => setRtsStatus(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Returned to Store">Returned to Store</option>
                  <option value="Warehouse Received">Warehouse Received</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RTS Reason</label>
                <textarea
                  value={rtsReason}
                  onChange={(e) => setRtsReason(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Reason for RTS..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RTS Date</label>
                <input
                  type="date"
                  value={rtsDate}
                  onChange={(e) => setRtsDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowRTSModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRTS}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Update RTS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;