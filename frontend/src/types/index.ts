export interface Driver {
  _id: string;
  name: string;
  phone: string;
  truckNo: string;
  empNo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone1: string;
  phone2?: string;
  address: string;
  city?: string;
  pincode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryItem {
  name: string;
  quantity: number;
  unit?: string;
}

export interface Remark {
  remark: string;
  addedBy: string;
  addedAt: string;
  remarkType: 'General' | 'Postponed' | 'Not Delivered' | 'RTS' | 'Replacement';
}

export interface Delivery {
  _id: string;
  customerId: Customer;
  driverId: Driver;
  invoiceNo: string;
  items: DeliveryItem[];
  status: 'Out for Delivery' | 'Delivered' | 'Not Delivered' | 'Postponed' | 'Replacement Scheduled' | 'On Hold' | 'Cancelled' | 'RTS';
  reason?: string;
  crmNo?: string;
  startTime?: string;
  endTime?: string;
  deliveredAt?: string;
  tripSheetId?: string;
  // New fields for enhanced tracking
  deliverySource?: string;
  cluster?: string;
  concept?: 'Homebox' | 'Homecenter' | 'Unknown';
  remarks?: Remark[];
  rtsStatus?: 'Not Applicable' | 'Returned to Store' | 'Warehouse Received';
  rtsReason?: string;
  rtsDate?: string;
  driverName?: string;
  driverPhone?: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  shift?: 'Morning' | 'Afternoon';
  failureReason?: string;
  failureReasonArabic?: string;
  postponedDate?: string;
  replacementDetails?: {
    pickupDate: string;
    deliveryDate: string;
    itemDescription: string;
    reason: string;
  };
  statusHistory?: Array<{
    status: string;
    reason: string;
    timestamp: string;
    updatedBy: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TripSheet {
  _id: string;
  driverId: string;
  date: string;
  deliveries: string[];
  startTime?: string;
  endTime?: string;
  totalDeliveries: number;
  completedDeliveries: number;
  status: 'Active' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryStats {
  total: number;
  outForDelivery: number;
  delivered: number;
  notDelivered: number;
  postponed: number;
  replacementScheduled: number;
  onHold: number;
  cancelled: number;
  rts: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
  totalDeliveries?: number;
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}
