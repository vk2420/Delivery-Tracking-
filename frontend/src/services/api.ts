import axios from 'axios';
import { Delivery, Driver, Customer, DeliveryStats, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload API
export const uploadTripSheet = async (file: File): Promise<ApiResponse<any>> => {
  const formData = new FormData();
  formData.append('tripSheet', file);
  
  const response = await api.post('/upload/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Deliveries API
export const getDeliveries = async (params?: {
  status?: string;
  driverId?: string;
  date?: string;
  cluster?: string;
  concept?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Delivery[]>> => {
  const response = await api.get('/deliveries', { params });
  return response.data;
};

export const getDelivery = async (id: string): Promise<ApiResponse<Delivery>> => {
  const response = await api.get(`/deliveries/${id}`);
  return response.data;
};

export const updateDeliveryStatus = async (
  id: string,
  status: string,
  reason?: string,
  additionalData?: any
): Promise<ApiResponse<Delivery>> => {
  const response = await api.patch(`/deliveries/${id}/status`, {
    status,
    reason,
    ...additionalData,
  });
  return response.data;
};

// Add remark to delivery
export const addDeliveryRemark = async (
  id: string,
  remark: string,
  remarkType: string,
  addedBy: string
): Promise<ApiResponse<Delivery>> => {
  const response = await api.post(`/deliveries/${id}/remarks`, {
    remark,
    remarkType,
    addedBy,
  });
  return response.data;
};

// Update RTS status
export const updateRTSStatus = async (
  id: string,
  rtsStatus: string,
  rtsReason?: string,
  rtsDate?: string
): Promise<ApiResponse<Delivery>> => {
  const response = await api.patch(`/deliveries/${id}/rts`, {
    rtsStatus,
    rtsReason,
    rtsDate,
  });
  return response.data;
};

// Get cluster and concept options
export const getClusterOptions = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get('/deliveries/cluster-options');
  return response.data;
};

export const getConceptOptions = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get('/deliveries/concept-options');
  return response.data;
};

export const getDeliveryStats = async (date?: string): Promise<ApiResponse<DeliveryStats>> => {
  const response = await api.get('/deliveries/stats/summary', {
    params: { date },
  });
  return response.data;
};

export const bulkUpdateDeliveryStatus = async (
  deliveryIds: string[],
  status: string,
  reason?: string
): Promise<ApiResponse<any>> => {
  const response = await api.patch('/deliveries/bulk/status', {
    deliveryIds,
    status,
    reason,
  });
  return response.data;
};

// Drivers API
export const getDrivers = async (): Promise<ApiResponse<Driver[]>> => {
  const response = await api.get('/drivers');
  return response.data;
};

export const getDriver = async (id: string): Promise<ApiResponse<Driver>> => {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
};

export const createDriver = async (driverData: Partial<Driver>): Promise<ApiResponse<Driver>> => {
  const response = await api.post('/drivers', driverData);
  return response.data;
};

export const updateDriver = async (id: string, driverData: Partial<Driver>): Promise<ApiResponse<Driver>> => {
  const response = await api.put(`/drivers/${id}`, driverData);
  return response.data;
};

export const deleteDriver = async (id: string): Promise<ApiResponse<any>> => {
  const response = await api.delete(`/drivers/${id}`);
  return response.data;
};

// Customers API
export const getCustomers = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Customer[]>> => {
  const response = await api.get('/customers', { params });
  return response.data;
};

export const getCustomer = async (id: string): Promise<ApiResponse<Customer>> => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<ApiResponse<Customer>> => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<ApiResponse<Customer>> => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id: string): Promise<ApiResponse<any>> => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

// Health check
export const healthCheck = async (): Promise<ApiResponse<any>> => {
  const response = await api.get('/health');
  return response.data;
};
