import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_DELIVERY_PROFILE,
  INITIAL_OWNER_STALL_DRAFT,
  INITIAL_SEED_ORDERS,
  PRESET_LOCATIONS,
  SEED_STALLS,
} from '../data/seedData';
import {
  AppRole,
  CartItem,
  Coordinates,
  DeliveryPartnerProfile,
  LanguageCode,
  MenuItem,
  Order,
  OrderMode,
  OrderStatus,
  Stall,
  UserAccount,
} from '../types/movana';

export function calculateDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.max(0.1, Number((R * c).toFixed(1)));
}

interface ToastMessage {
  id: number;
  text: string;
  tone: 'success' | 'info' | 'error';
}

interface MovanaContextValue {
  // Navigation & onboarding
  consentAccepted: boolean;
  acceptConsent: (requestLocation?: boolean) => void;
  showRolePicker: boolean;
  setShowRolePicker: (show: boolean) => void;
  activeRole: AppRole;
  navigateToRole: (role: AppRole, hashSection?: string) => void;

  // Theme & Language & Accessibility
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  // User Location
  userLocationLabel: string;
  userCoords: Coordinates;
  gpsAccuracyMeters: number;
  setPresetLocation: (locationId: string) => void;
  detectUserLocation: () => void;

  // User Account & Auth
  userAccount: UserAccount;
  signInUser: (name: string, email: string, phone: string, address: string) => void;
  signInAsAdmin: () => void;
  signOutUser: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Stalls & Favorites
  stalls: Stall[];
  favorites: string[];
  toggleFavorite: (stallId: string) => void;
  ownerStall: Stall;
  updateOwnerStall: (patch: Partial<Stall>) => void;
  addOwnerMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  removeOwnerMenuItem: (itemId: string) => void;
  saveOwnerStallToPlatform: () => void;
  submitOwnerForVerification: () => void;
  toggleOwnerGoLive: () => void;

  // Cart & Orders
  cart: CartItem[];
  addToCart: (stallId: string, item: MenuItem) => void;
  updateCartQuantity: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  orders: Order[];
  placeOrder: (payload: {
    mode: OrderMode;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: 'UPI' | 'Card' | 'Netbanking';
  }) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignOrderToRider: (orderId: string) => void;
  completeDeliveryWithCode: (orderId: string, enteredCode: string) => boolean;
  activeTrackerOrderId: string | null;
  setActiveTrackerOrderId: (id: string | null) => void;

  // Delivery Partner
  deliveryProfile: DeliveryPartnerProfile;
  updateDeliveryProfile: (patch: Partial<DeliveryPartnerProfile>) => void;
  submitDeliveryProfileForApproval: () => void;
  toggleDeliveryOnline: () => void;

  // Admin Actions
  approveStall: (stallId: string) => void;
  rejectStall: (stallId: string) => void;
  approveDeliveryPartner: () => void;
  rejectDeliveryPartner: () => void;

  // Utilities
  showToast: (text: string, tone?: 'success' | 'info' | 'error') => void;
  toast: ToastMessage | null;
  legalModalTopic: string | null;
  setLegalModalTopic: (topic: string | null) => void;
  helperOpen: boolean;
  setHelperOpen: (open: boolean) => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'movana_platform_state_v21';

interface PersistedState {
  consentAccepted: boolean;
  showRolePicker: boolean;
  activeRole: AppRole;
  darkMode: boolean;
  language: LanguageCode;
  userLocationLabel: string;
  userCoords: Coordinates;
  userAccount: UserAccount;
  stalls: Stall[];
  ownerStall: Stall;
  favorites: string[];
  orders: Order[];
  deliveryProfile: DeliveryPartnerProfile;
}

function loadState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return {};
  }
}

const MovanaContext = createContext<MovanaContextValue | null>(null);

export function MovanaProvider({ children }: { children: React.ReactNode }) {
  const saved = useMemo(() => loadState(), []);

  const [consentAccepted, setConsentAccepted] = useState<boolean>(
    saved.consentAccepted ?? false
  );
  const [showRolePicker, setShowRolePicker] = useState<boolean>(
    saved.showRolePicker ?? true
  );
  const [activeRole, setActiveRole] = useState<AppRole>(
    saved.activeRole ?? 'customer'
  );
  const [darkMode, setDarkMode] = useState<boolean>(saved.darkMode ?? false);
  const [language, setLanguage] = useState<LanguageCode>(saved.language ?? 'en');

  const [userLocationLabel, setUserLocationLabel] = useState<string>(
    saved.userLocationLabel ?? PRESET_LOCATIONS[0].label
  );
  const [userCoords, setUserCoords] = useState<Coordinates>(
    saved.userCoords ?? PRESET_LOCATIONS[0].coords
  );
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number>(35);

  const [userAccount, setUserAccount] = useState<UserAccount>(
    saved.userAccount ?? {
      signedIn: false,
      name: '',
      email: '',
      phone: '',
      address: 'House 18, Street 2, Agar Nagar, Ludhiana',
      isAdmin: false,
    }
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [stalls, setStalls] = useState<Stall[]>(saved.stalls ?? SEED_STALLS);
  const [ownerStall, setOwnerStall] = useState<Stall>(
    saved.ownerStall ?? INITIAL_OWNER_STALL_DRAFT
  );
  const [favorites, setFavorites] = useState<string[]>(saved.favorites ?? []);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(saved.orders ?? INITIAL_SEED_ORDERS);
  const [activeTrackerOrderId, setActiveTrackerOrderId] = useState<string | null>(null);

  const [deliveryProfile, setDeliveryProfile] = useState<DeliveryPartnerProfile>(
    saved.deliveryProfile ?? INITIAL_DELIVERY_PROFILE
  );

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [legalModalTopic, setLegalModalTopic] = useState<string | null>(null);
  const [helperOpen, setHelperOpen] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist to localStorage
  useEffect(() => {
    try {
      const payload: PersistedState = {
        consentAccepted,
        showRolePicker,
        activeRole,
        darkMode,
        language,
        userLocationLabel,
        userCoords,
        userAccount,
        stalls,
        ownerStall,
        favorites,
        orders,
        deliveryProfile,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors if very large base64 photos are uploaded
    }
  }, [
    consentAccepted,
    showRolePicker,
    activeRole,
    darkMode,
    language,
    userLocationLabel,
    userCoords,
    userAccount,
    stalls,
    ownerStall,
    favorites,
    orders,
    deliveryProfile,
  ]);

  const showToast = (text: string, tone: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToast({ id, text, tone });
    window.setTimeout(() => {
      setToast((prev) => (prev && prev.id === id ? null : prev));
    }, 3600);
  };

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      showToast('Using Agar Nagar, Ludhiana as default locality.', 'info');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCoords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        };
        // Keep demo stalls nearby if user is far away from Ludhiana, or center on Agar Nagar
        const distToLudhiana = calculateDistanceKm(nextCoords, PRESET_LOCATIONS[0].coords);
        if (distToLudhiana > 25) {
          setUserCoords(PRESET_LOCATIONS[0].coords);
          setUserLocationLabel('Agar Nagar, Ludhiana (Live GPS)');
          setGpsAccuracyMeters(Math.min(60, Math.max(12, Math.round(pos.coords.accuracy || 28))));
          showToast('Location calibrated to live Ludhiana thela zone (±28 m).', 'success');
        } else {
          setUserCoords(nextCoords);
          setUserLocationLabel('Current Location, Ludhiana');
          setGpsAccuracyMeters(Math.round(pos.coords.accuracy || 25));
          showToast('Live GPS location updated.', 'success');
        }
      },
      () => {
        setUserCoords(PRESET_LOCATIONS[0].coords);
        setUserLocationLabel('Agar Nagar, Ludhiana');
        setGpsAccuracyMeters(35);
        showToast('Location set to Agar Nagar, Ludhiana.', 'info');
      },
      { timeout: 4000 }
    );
  };

  const acceptConsent = (requestLocation = true) => {
    setConsentAccepted(true);
    if (requestLocation) {
      detectUserLocation();
    }
  };

  const navigateToRole = (role: AppRole, hashSection?: string) => {
    setActiveRole(role);
    setShowRolePicker(false);
    const hashMap: Record<AppRole, string> = {
      customer: hashSection ? `#${hashSection}` : '#live',
      vendor: '#vendor',
      delivery: '#delivery',
      admin: '#admin',
    };
    window.history.replaceState(null, '', hashMap[role]);
    if (hashSection) {
      window.setTimeout(() => {
        const el = document.getElementById(hashSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setPresetLocation = (locationId: string) => {
    const found = PRESET_LOCATIONS.find((l) => l.id === locationId);
    if (found) {
      setUserLocationLabel(found.label);
      setUserCoords(found.coords);
      setGpsAccuracyMeters(25);
      showToast(`Location switched to ${found.label}`, 'info');
    }
  };

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const signInUser = (name: string, email: string, phone: string, address: string) => {
    setUserAccount({
      signedIn: true,
      name: name.trim() || 'Móvana User',
      email: email.trim() || 'user@movana.app',
      phone: phone.trim(),
      address: address.trim() || 'House 18, Street 2, Agar Nagar, Ludhiana',
      isAdmin: email.toLowerCase().includes('admin@movana'),
    });
    setAuthModalOpen(false);
    showToast(`Signed in as ${name.trim() || 'Móvana User'}`, 'success');
  };

  const signInAsAdmin = () => {
    setUserAccount((prev) => ({
      ...prev,
      signedIn: true,
      name: prev.name || 'Móvana Operations Admin',
      email: 'admin@movana.app',
      isAdmin: true,
    }));
    navigateToRole('admin');
    showToast('Signed in to Móvana Company Admin Console', 'success');
  };

  const signOutUser = () => {
    setUserAccount({
      signedIn: false,
      name: '',
      email: '',
      phone: '',
      address: 'House 18, Street 2, Agar Nagar, Ludhiana',
      isAdmin: false,
    });
    showToast('Signed out', 'info');
  };

  const toggleFavorite = (stallId: string) => {
    setFavorites((prev) =>
      prev.includes(stallId) ? prev.filter((id) => id !== stallId) : [...prev, stallId]
    );
  };

  // Owner Stall Handlers
  const updateOwnerStall = (patch: Partial<Stall>) => {
    setOwnerStall((prev) => {
      const updated = { ...prev, ...patch };
      setStalls((all) =>
        all.some((s) => s.id === updated.id)
          ? all.map((s) => (s.id === updated.id ? updated : s))
          : all
      );
      return updated;
    });
  };

  const addOwnerMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    updateOwnerStall({ menu: [...ownerStall.menu, newItem] });
    showToast(`Added "${newItem.name}" to your stall menu`, 'success');
  };

  const removeOwnerMenuItem = (itemId: string) => {
    updateOwnerStall({ menu: ownerStall.menu.filter((m) => m.id !== itemId) });
  };

  const saveOwnerStallToPlatform = () => {
    if (!ownerStall.name.trim()) {
      showToast('Please enter your stall name before saving.', 'error');
      return;
    }
    const stallToSave: Stall = {
      ...ownerStall,
      photos:
        ownerStall.photos.length > 0
          ? ownerStall.photos
          : ['/src/assets/images/ludhiana_chaat_samosa_stall_1795625157634.jpg'],
    };
    setOwnerStall(stallToSave);
    setStalls((prev) => {
      const exists = prev.some((s) => s.id === stallToSave.id);
      if (exists) {
        return prev.map((s) => (s.id === stallToSave.id ? stallToSave : s));
      }
      return [stallToSave, ...prev];
    });
    showToast('Stall profile & menu saved!', 'success');
  };

  const submitOwnerForVerification = () => {
    if (!ownerStall.name.trim()) {
      showToast('Complete Step 2 (Stall name) before submitting for verification.', 'error');
      return;
    }
    const updated: Stall = {
      ...ownerStall,
      verificationStatus: 'pending',
      photos:
        ownerStall.photos.length > 0
          ? ownerStall.photos
          : ['/src/assets/images/ludhiana_chaat_samosa_stall_1795625157634.jpg'],
    };
    setOwnerStall(updated);
    setStalls((prev) => {
      const exists = prev.some((s) => s.id === updated.id);
      return exists ? prev.map((s) => (s.id === updated.id ? updated : s)) : [updated, ...prev];
    });
    showToast('Stall submitted for Company Admin review!', 'success');
  };

  const toggleOwnerGoLive = () => {
    if (ownerStall.verificationStatus !== 'approved') {
      showToast('Your stall must be approved by Company Admin before going live.', 'error');
      return;
    }
    const nextLive = !ownerStall.isLive;
    const updated: Stall = {
      ...ownerStall,
      isLive: nextLive,
      coords: {
        lat: userCoords.lat + 0.0021,
        lng: userCoords.lng + 0.0018,
      },
    };
    setOwnerStall(updated);
    setStalls((prev) => {
      const exists = prev.some((s) => s.id === updated.id);
      return exists ? prev.map((s) => (s.id === updated.id ? updated : s)) : [updated, ...prev];
    });
    showToast(
      nextLive
        ? `${updated.name} is now LIVE on the customer map!`
        : `${updated.name} is now offline.`,
      nextLive ? 'success' : 'info'
    );
  };

  // Cart & Order Handlers
  const addToCart = (stallId: string, item: MenuItem) => {
    setCart((prev) => {
      if (prev.length > 0 && prev[0].stallId !== stallId) {
        showToast('Started a fresh cart for this stall.', 'info');
        return [{ stallId, menuItem: item, quantity: 1 }];
      }
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { stallId, menuItem: item, quantity: 1 }];
    });
    showToast(`Added ${item.name} to cart`, 'success');
  };

  const updateCartQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItem.id === menuItemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder: MovanaContextValue['placeOrder'] = ({
    mode,
    customerName,
    customerPhone,
    deliveryAddress,
    paymentMethod,
  }) => {
    if (cart.length === 0) return null;
    const stall = stalls.find((s) => s.id === cart[0].stallId);
    if (!stall) return null;

    const subtotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
    const platformFee = Math.max(1, Math.round(subtotal * 0.05));
    const deliveryFee = mode === 'delivery' ? 15 : 0;
    const total = subtotal + platformFee + deliveryFee;
    const deliveryCode = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `MV-${Math.floor(4100 + Math.random() * 5800)}`,
      stallId: stall.id,
      stallName: stall.name,
      stallAddress: stall.address,
      customerName: customerName.trim() || userAccount.name || 'Guest Customer',
      customerPhone: customerPhone.trim() || userAccount.phone || '9814000000',
      deliveryAddress:
        mode === 'dineout'
          ? `Pickup at ${stall.address}`
          : deliveryAddress.trim() || userAccount.address,
      mode,
      items: cart.map((c) => ({
        id: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity,
        isVeg: c.menuItem.isVeg,
      })),
      subtotal,
      platformFee,
      deliveryFee,
      total,
      paymentMethod,
      deliveryCode,
      status: 'placed',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setCartDrawerOpen(false);
    setActiveTrackerOrderId(newOrder.id);
    showToast(`Order ${newOrder.orderNumber} placed! 4-digit code: ${deliveryCode}`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast(`Order updated to ${status.replace('_', ' ')}`, 'info');
  };

  const assignOrderToRider = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              riderId: 'partner-self',
              riderName: deliveryProfile.fullName || 'Móvana Rider',
              status: o.status === 'placed' ? 'accepted' : o.status,
            }
          : o
      )
    );
    showToast('Delivery request accepted! Head to the stall for pickup.', 'success');
  };

  const completeDeliveryWithCode = (orderId: string, enteredCode: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;
    if (order.deliveryCode.trim() !== enteredCode.trim()) {
      showToast('Incorrect 4-digit customer code. Please verify with the customer.', 'error');
      return false;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'delivered', riderRating: 5 } : o
      )
    );
    setDeliveryProfile((prev) => {
      const nextCount = prev.ratingCount + 1;
      const nextAvg = Number(
        (((prev.rating * prev.ratingCount) + 5) / nextCount).toFixed(1)
      );
      return { ...prev, rating: nextAvg, ratingCount: nextCount };
    });
    showToast('Handover verified! Delivery marked complete.', 'success');
    return true;
  };

  // Delivery Partner Handlers
  const updateDeliveryProfile = (patch: Partial<DeliveryPartnerProfile>) => {
    setDeliveryProfile((prev) => ({ ...prev, ...patch }));
  };

  const submitDeliveryProfileForApproval = () => {
    if (!deliveryProfile.fullName.trim() || !deliveryProfile.vehicleType) {
      showToast('Please enter your name and choose a vehicle type.', 'error');
      return;
    }
    setDeliveryProfile((prev) => ({
      ...prev,
      verificationStatus: 'pending',
    }));
    showToast('Vehicle registration submitted for admin approval!', 'success');
  };

  const toggleDeliveryOnline = () => {
    if (deliveryProfile.verificationStatus !== 'approved') {
      showToast('Vehicle approval required before going online.', 'error');
      return;
    }
    setDeliveryProfile((prev) => {
      const next = !prev.isOnline;
      showToast(next ? 'You are now online and visible for pickups!' : 'You are now offline.', 'info');
      return { ...prev, isOnline: next };
    });
  };

  // Admin Handlers
  const approveStall = (stallId: string) => {
    setStalls((prev) =>
      prev.map((s) =>
        s.id === stallId ? { ...s, verificationStatus: 'approved' } : s
      )
    );
    if (ownerStall.id === stallId) {
      setOwnerStall((prev) => ({ ...prev, verificationStatus: 'approved' }));
    }
    showToast('Stall approved! Owner can now go live on the map.', 'success');
  };

  const rejectStall = (stallId: string) => {
    setStalls((prev) =>
      prev.map((s) =>
        s.id === stallId ? { ...s, verificationStatus: 'rejected', isLive: false } : s
      )
    );
    if (ownerStall.id === stallId) {
      setOwnerStall((prev) => ({
        ...prev,
        verificationStatus: 'rejected',
        isLive: false,
      }));
    }
    showToast('Stall verification returned for corrections.', 'info');
  };

  const approveDeliveryPartner = () => {
    setDeliveryProfile((prev) => ({
      ...prev,
      verificationStatus: 'approved',
    }));
    showToast('Delivery partner vehicle approved!', 'success');
  };

  const rejectDeliveryPartner = () => {
    setDeliveryProfile((prev) => ({
      ...prev,
      verificationStatus: 'rejected',
      isOnline: false,
    }));
    showToast('Delivery partner vehicle application rejected.', 'info');
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStalls(SEED_STALLS);
    setOwnerStall(INITIAL_OWNER_STALL_DRAFT);
    setOrders(INITIAL_SEED_ORDERS);
    setDeliveryProfile(INITIAL_DELIVERY_PROFILE);
    setFavorites([]);
    setCart([]);
    setConsentAccepted(false);
    setShowRolePicker(true);
    setActiveRole('customer');
    setLegalModalTopic(null);
    showToast('All local Móvana demo data has been cleared.', 'info');
  };

  return (
    <MovanaContext.Provider
      value={{
        consentAccepted,
        acceptConsent,
        showRolePicker,
        setShowRolePicker,
        activeRole,
        navigateToRole,
        darkMode,
        toggleDarkMode,
        language,
        setLanguage,
        userLocationLabel,
        userCoords,
        gpsAccuracyMeters,
        setPresetLocation,
        detectUserLocation,
        userAccount,
        signInUser,
        signInAsAdmin,
        signOutUser,
        authModalOpen,
        setAuthModalOpen,
        stalls,
        favorites,
        toggleFavorite,
        ownerStall,
        updateOwnerStall,
        addOwnerMenuItem,
        removeOwnerMenuItem,
        saveOwnerStallToPlatform,
        submitOwnerForVerification,
        toggleOwnerGoLive,
        cart,
        addToCart,
        updateCartQuantity,
        clearCart,
        cartDrawerOpen,
        setCartDrawerOpen,
        orders,
        placeOrder,
        updateOrderStatus,
        assignOrderToRider,
        completeDeliveryWithCode,
        activeTrackerOrderId,
        setActiveTrackerOrderId,
        deliveryProfile,
        updateDeliveryProfile,
        submitDeliveryProfileForApproval,
        toggleDeliveryOnline,
        approveStall,
        rejectStall,
        approveDeliveryPartner,
        rejectDeliveryPartner,
        showToast,
        toast,
        legalModalTopic,
        setLegalModalTopic,
        helperOpen,
        setHelperOpen,
        resetAllData,
      }}
    >
      {children}
    </MovanaContext.Provider>
  );
}

export function useMovana() {
  const ctx = useContext(MovanaContext);
  if (!ctx) throw new Error('useMovana must be used inside MovanaProvider');
  return ctx;
}
