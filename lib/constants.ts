export const CROP_CATEGORIES = [
  'Grains',
  'Vegetables',
  'Fruits',
  'Pulses',
  'Spices',
  'Oilseeds',
  'Cash Crops',
  'Dairy',
] as const;

export const CROP_UNITS = ['kg', 'quintal', 'ton', 'dozen', 'bunch'] as const;

export const ORDER_STATUS_FLOW: { status: string; label: string }[] = [
  { status: 'placed', label: 'Order Placed' },
  { status: 'packed', label: 'Packed' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'delivered', label: 'Delivered' },
];

export const ORDER_STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700 border-blue-200',
  packed: 'bg-amber-100 text-amber-700 border-amber-200',
  in_transit: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

// Fair price reference data per crop (per kg in INR)
export const FAIR_PRICE_DATA: Record<string, { min: number; max: number; avg: number; unit: string }> = {
  Rice: { min: 28, max: 45, avg: 36, unit: 'kg' },
  Wheat: { min: 22, max: 35, avg: 28, unit: 'kg' },
  Tomato: { min: 15, max: 40, avg: 25, unit: 'kg' },
  Onion: { min: 18, max: 38, avg: 28, unit: 'kg' },
  Potato: { min: 12, max: 28, avg: 20, unit: 'kg' },
  Mango: { min: 40, max: 80, avg: 55, unit: 'kg' },
  Banana: { min: 20, max: 45, avg: 32, unit: 'kg' },
  Cotton: { min: 55, max: 75, avg: 65, unit: 'kg' },
  Sugarcane: { min: 3, max: 5, avg: 4, unit: 'kg' },
  'Tur Dal': { min: 70, max: 110, avg: 90, unit: 'kg' },
  Chilli: { min: 80, max: 150, avg: 110, unit: 'kg' },
  Groundnut: { min: 50, max: 75, avg: 62, unit: 'kg' },
  Maize: { min: 18, max: 28, avg: 23, unit: 'kg' },
  Carrot: { min: 20, max: 45, avg: 32, unit: 'kg' },
  Spinach: { min: 15, max: 35, avg: 25, unit: 'kg' },
};

export const REGIONS = [
  'Karnataka',
  'Maharashtra',
  'Punjab',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Gujarat',
  'Madhya Pradesh',
  'Uttar Pradesh',
  'West Bengal',
  'Kerala',
];
