export type AppRole = 'customer' | 'vendor' | 'delivery' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'pa';

export type StallCategory = 'Street food' | 'Vegetables' | 'Beverages' | 'Sweets & Snacks';

export type FoodDietaryType = 'Veg and non-veg' | 'Pure Veg' | 'Non-veg';

export type VerificationStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

export type OrderMode = 'delivery' | 'dineout';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
  description: string;
  photo?: string;
}

export interface Stall {
  id: string;
  name: string;
  stallType: StallCategory;
  pinEmoji: string;
  foodType: FoodDietaryType;
  publicPhone: string;
  shortDescription: string;
  allergens: string;
  address: string;
  upiId: string;
  upiQrImage?: string;
  photos: string[];
  menu: MenuItem[];
  coords: Coordinates;
  rating: number;
  reviewCount: number;
  isLive: boolean;
  isOwnerStall?: boolean;
  dineoutOffer?: string;
  deliveryOffer?: string;
  fssaiNumber?: string;
  ownerName?: string;
  ownerPhone?: string;
  aadhaarLast4?: string;
  aadhaarPhoto?: string;
  verificationStatus: VerificationStatus;
}

export interface CartItem {
  stallId: string;
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  stallId: string;
  stallName: string;
  stallAddress: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  mode: OrderMode;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    isVeg: boolean;
  }[];
  subtotal: number;
  platformFee: number; // flat 5%
  deliveryFee: number;
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'Netbanking';
  deliveryCode: string; // 4-digit handover code
  status: OrderStatus;
  createdAt: string;
  riderId?: string;
  riderName?: string;
  riderRating?: number;
}

export interface DeliveryPartnerProfile {
  fullName: string;
  phone: string;
  vehicleType: string;
  rcNumber: string;
  aadhaarLast4: string;
  aadhaarPhoto?: string;
  verificationStatus: VerificationStatus;
  isOnline: boolean;
  rating: number;
  ratingCount: number;
}

export interface UserAccount {
  signedIn: boolean;
  name: string;
  email: string;
  phone: string;
  address: string;
  isAdmin: boolean;
}

export interface PresetLocation {
  id: string;
  label: string;
  coords: Coordinates;
}
