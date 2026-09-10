export type Crop = {
  id: string;
  name: string;
  category: string;
  price_per_unit: number;
  unit: string;
  quantity: number;
  quantity_unit: string;
  harvest_date: string | null;
  location: string;
  region: string;
  farmer_name: string;
  quality: string;
  image: string;
  description: string | null;
  active: boolean;
  created_at: string;
};

export type OrderStatus = 'placed' | 'packed' | 'in_transit' | 'delivered' | 'rejected';

export type Order = {
  id: string;
  crop_id: string;
  crop_name: string;
  farmer_name: string;
  retailer_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Inquiry = {
  id: string;
  crop_id: string;
  crop_name: string;
  farmer_name: string;
  retailer_name: string;
  message: string;
  contact: string | null;
  created_at: string;
};

export type FairPrice = {
  id: string;
  crop_name: string;
  category: string;
  region: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  updated_at: string;
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ['placed', 'packed', 'in_transit', 'delivered'];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  packed: 'Packed',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

export const ORDER_STATUS_STEP: Record<OrderStatus, number> = {
  placed: 0,
  packed: 1,
  in_transit: 2,
  delivered: 3,
  rejected: -1,
};

export const CATEGORIES = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices'] as const;
export const REGIONS = ['Karnataka', 'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh'] as const;
