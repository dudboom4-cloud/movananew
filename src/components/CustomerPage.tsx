import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  MapPin,
  Mic,
  Minus,
  Navigation,
  Phone,
  Plus,
  QrCode,
  Search,
  ShoppingBag,
  Smartphone,
  Star,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { calculateDistanceKm, useMovana } from '../context/MovanaContext';
import { FAQ_DATA, PRESET_LOCATIONS, UI_TRANSLATIONS } from '../data/seedData';
import { Order, OrderMode, Stall } from '../types/movana';
import {
  DineoutPlateArt,
  FoodDeliveryPlateArt,
  ThelaCartIcon,
} from './BrandAssets';
import { LiveStallMap } from './LiveStallMap';
import { MovanaFooter, MovanaTopNav } from './MovanaChrome';

export function CustomerPage() {
  const {
    stalls,
    userLocationLabel,
    userCoords,
    gpsAccuracyMeters,
    setPresetLocation,
    detectUserLocation,
    favorites,
    toggleFavorite,
    cart,
    addToCart,
    updateCartQuantity,
    clearCart,
    cartDrawerOpen,
    setCartDrawerOpen,
    orders,
    placeOrder,
    updateOrderStatus,
    activeTrackerOrderId,
    setActiveTrackerOrderId,
    userAccount,
    language,
    showToast,
  } = useMovana();

  const t = UI_TRANSLATIONS[language];

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [categoryTab, setCategoryTab] = useState<'all' | 'food' | 'vegetables'>('all');
  const [orderModeBanner, setOrderModeBanner] = useState<OrderMode>('delivery');
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [rating4Plus, setRating4Plus] = useState(false);
  const [within1Km, setWithin1Km] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'top_rated'>('nearest');
  const [focusedStallId, setFocusedStallId] = useState<string | null>(null);
  const [openMenuStall, setOpenMenuStall] = useState<Stall | null>(null);

  // Help Centre FAQ state
  const [faqCategory, setFaqCategory] = useState<'ordering' | 'owners' | 'partners'>('ordering');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // PWA Install bar & modal
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Checkout state
  const [checkoutMode, setCheckoutMode] = useState<OrderMode>('delivery');
  const [checkoutName, setCheckoutName] = useState(userAccount.name || '');
  const [checkoutPhone, setCheckoutPhone] = useState(userAccount.phone || '');
  const [checkoutAddress, setCheckoutAddress] = useState(
    userAccount.address || 'House 18, Street 2, Agar Nagar, Ludhiana'
  );
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Netbanking'>('UPI');

  // Voice search handler
  const handleVoiceSearch = () => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setSearchQuery('pav bhaji');
      showToast('Voice quick-search: "pav bhaji"', 'info');
      return;
    }
    const rec = new SpeechRec();
    rec.lang = language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN';
    rec.onresult = (event: any) => {
      const spoken = event.results?.[0]?.[0]?.transcript || '';
      if (spoken) {
        setSearchQuery(spoken);
        showToast(`Searching for "${spoken}"`, 'info');
      }
    };
    rec.onerror = () => {
      showToast('Microphone unavailable—type your craving above.', 'info');
    };
    rec.start();
    showToast('Listening for stall or dish name...', 'info');
  };

  // Live stalls with calculated distance
  const liveStalls = useMemo(() => {
    return stalls
      .filter((s) => s.isLive && s.verificationStatus === 'approved')
      .map((s) => ({
        ...s,
        distanceKm: calculateDistanceKm(userCoords, s.coords),
      }));
  }, [stalls, userCoords]);

  // Dynamic collections built from live stall menu items (matches Screenshot 4: coke, pav bhaji 1pc, sauce, etc.)
  const collections = useMemo(() => {
    const map = new Map<string, number>();
    liveStalls.forEach((stall) => {
      const seenInStall = new Set<string>();
      stall.menu.forEach((item) => {
        const key = item.name.trim();
        if (!seenInStall.has(key.toLowerCase())) {
          seenInStall.add(key.toLowerCase());
          map.set(key, (map.get(key) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .slice(0, 8);
  }, [liveStalls]);

  // Filtered & sorted live stalls
  const filteredStalls = useMemo(() => {
    return liveStalls
      .filter((stall) => {
        if (categoryTab === 'food' && stall.stallType === 'Vegetables') return false;
        if (categoryTab === 'vegetables' && stall.stallType !== 'Vegetables') return false;
        if (rating4Plus && stall.rating < 4.0) return false;
        if (within1Km && stall.distanceKm > 1.0) return false;
        if (collectionFilter) {
          const hasItem = stall.menu.some(
            (m) => m.name.toLowerCase() === collectionFilter.toLowerCase()
          );
          if (!hasItem) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inName = stall.name.toLowerCase().includes(q);
          const inDesc = stall.shortDescription.toLowerCase().includes(q);
          const inMenu = stall.menu.some(
            (m) =>
              m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
          );
          if (!inName && !inDesc && !inMenu) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sortBy === 'nearest' ? a.distanceKm - b.distanceKm : b.rating - a.rating
      );
  }, [
    liveStalls,
    categoryTab,
    rating4Plus,
    within1Km,
    collectionFilter,
    searchQuery,
    sortBy,
  ]);

  // Cart calculations
  const cartStall = cart.length > 0 ? stalls.find((s) => s.id === cart[0].stallId) : null;
  const cartSubtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartPlatformFee = cartSubtotal > 0 ? Math.max(1, Math.round(cartSubtotal * 0.05)) : 0;
  const cartDeliveryFee = checkoutMode === 'delivery' && cartSubtotal > 0 ? 15 : 0;
  const cartTotal = cartSubtotal + cartPlatformFee + cartDeliveryFee;

  const trackedOrder: Order | undefined = orders.find(
    (o) => o.id === activeTrackerOrderId
  );
  const latestActiveOrder = orders.find(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const scrollToLive = (mode?: OrderMode) => {
    if (mode) {
      setOrderModeBanner(mode);
      setCheckoutMode(mode);
    }
    const el = document.getElementById('live');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPhone.trim() || checkoutPhone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit phone number for order updates.', 'error');
      return;
    }
    placeOrder({
      mode: checkoutMode,
      customerName: checkoutName || userAccount.name || 'Móvana Customer',
      customerPhone: checkoutPhone,
      deliveryAddress: checkoutAddress,
      paymentMethod,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-[#161210] text-[#24140E] dark:text-[#FAF3EB] flex flex-col">
      <MovanaTopNav
        showRoleStrip
        onOpenInstallModal={() => setInstallModalOpen(true)}
      />

      {/* HERO BANNER — Screenshot 3 */}
      <section className="relative movana-hero-gradient text-white overflow-hidden">
        {/* Decorative Left Grocery Bag Art */}
        <div
          className="pointer-events-none select-none hidden lg:block absolute -left-8 bottom-0 opacity-90"
          aria-hidden="true"
        >
          <svg viewBox="0 0 220 260" className="w-52 h-64">
            <circle cx="40" cy="210" r="110" fill="#B91C1C" opacity="0.45" />
            <circle cx="85" cy="95" r="24" fill="#FBBF24" />
            <circle cx="52" cy="112" r="20" fill="#EF4444" />
            <circle cx="115" cy="108" r="22" fill="#FDE047" />
            <path d="M10 120L95 102L122 225L28 245Z" fill="#C48852" />
            <path d="M10 120L95 102L100 125L15 142Z" fill="#A66D3B" />
          </svg>
        </div>

        {/* Decorative Right Chopsticks / Bento Art */}
        <div
          className="pointer-events-none select-none hidden lg:block absolute -right-4 top-6 opacity-90"
          aria-hidden="true"
        >
          <svg viewBox="0 0 260 280" className="w-60 h-64">
            <circle cx="185" cy="130" r="120" fill="#FB923C" opacity="0.38" />
            <rect
              x="120"
              y="26"
              width="120"
              height="180"
              rx="22"
              transform="rotate(-14 120 26)"
              fill="#FFFBF5"
            />
            <rect
              x="140"
              y="58"
              width="34"
              height="20"
              rx="6"
              transform="rotate(-14 140 58)"
              fill="#F87171"
            />
            <rect
              x="178"
              y="49"
              width="34"
              height="20"
              rx="6"
              transform="rotate(-14 178 49)"
              fill="#FB7185"
            />
            <circle cx="164" cy="118" r="14" fill="#451A03" />
            <circle cx="164" cy="118" r="8" fill="#FEF3C7" />
            <circle cx="164" cy="118" r="4" fill="#F59E0B" />
            <circle cx="202" cy="109" r="14" fill="#451A03" />
            <circle cx="202" cy="109" r="8" fill="#FEF3C7" />
            <circle cx="202" cy="109" r="4" fill="#EF4444" />
            <line x1="78" y1="142" x2="232" y2="38" stroke="#7C3F19" strokeWidth="5" strokeLinecap="round" />
            <line x1="88" y1="154" x2="242" y2="52" stroke="#5A2B0E" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative max-w-[960px] mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-12 sm:pb-14">
          <h1
            className="text-center text-[32px] sm:text-[44px] font-extrabold tracking-tight leading-[1.12] drop-shadow-xs"
            style={{ textWrap: 'balance' }}
          >
            {t.heroHeadline}
          </h1>

          {/* Unified Location + Search Bar (Screenshot 3) */}
          <div className="mt-7 max-w-[740px] mx-auto bg-white dark:bg-[#221B17] rounded-2xl shadow-xl shadow-black/15 p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Location Picker */}
            <div className="relative sm:w-[235px] shrink-0">
              <button
                type="button"
                onClick={() => setLocationMenuOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[#24140E] dark:text-[#FAF3EB] hover:bg-[#FAF2E8] dark:hover:bg-[#2F251F] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-[#E23428] shrink-0" />
                  <span className="text-[13.5px] font-bold truncate">
                    {userLocationLabel}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4 text-[#8C7A70] shrink-0" />
              </button>

              {locationMenuOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#261E1A] rounded-2xl shadow-xl border border-[#EDE3D8] dark:border-[#3D312B] p-1.5 z-50 text-[#24140E] dark:text-[#FAF3EB]">
                  <button
                    type="button"
                    onClick={() => {
                      detectUserLocation();
                      setLocationMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-[#E23428] hover:bg-[#FFF3EE] dark:hover:bg-[#35241D] cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Detect my live GPS location
                  </button>
                  <div className="my-1 border-t border-[#F0E6DC] dark:border-[#3A2E27]" />
                  {PRESET_LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setPresetLocation(loc.id);
                        setLocationMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#FAF2E8] dark:hover:bg-[#332720] cursor-pointer"
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-7 bg-[#E7DDD2] dark:bg-[#3D312B]" />

            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 px-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') scrollToLive();
                }}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent py-2 text-[14px] text-[#24140E] dark:text-[#FAF3EB] placeholder:text-[#9C8B82] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="p-1.5 text-[#8C7A70] hover:text-[#24140E] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => scrollToLive()}
                aria-label="Search stalls"
                className="p-2 text-[#5B4940] dark:text-[#CFC0B7] hover:text-[#E23428] cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleVoiceSearch}
                aria-label="Voice search"
                title="Voice search"
                className="w-9 h-9 rounded-full bg-[#FEF3C7] dark:bg-[#3D2F18] text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center hover:brightness-95 transition-all shrink-0 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Two White Hero Cards: FOOD DELIVERY & DINEOUT (Screenshot 3) */}
          <div className="mt-7 max-w-[780px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* FOOD DELIVERY Card */}
            <button
              type="button"
              onClick={() => scrollToLive('delivery')}
              className={`text-left bg-white dark:bg-[#221B17] text-[#24140E] dark:text-[#FAF3EB] rounded-[22px] p-5 sm:p-6 shadow-xl shadow-black/10 hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[188px] cursor-pointer ${
                orderModeBanner === 'delivery' ? 'ring-2 ring-white/80' : ''
              }`}
            >
              <div>
                <h2 className="text-[21px] font-extrabold tracking-tight leading-none">
                  {t.foodDelivery}
                </h2>
                <p className="mt-1.5 text-[12px] font-bold tracking-wide text-[#7E6B62] dark:text-[#B8A79D]">
                  FROM RESTAURANTS &amp; STALLS
                </p>
                <span className="mt-3 inline-block px-2.5 py-1 rounded-md bg-[#FFF1EB] dark:bg-[#39211A] text-[#E23428] text-[11px] font-extrabold tracking-wide">
                  UPTO 60% OFF
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-2">
                <span className="w-10 h-10 rounded-full bg-[#E23428] text-white flex items-center justify-center shadow-md shadow-[#E23428]/30">
                  <ArrowRight className="w-5 h-5" />
                </span>
                <FoodDeliveryPlateArt />
              </div>
            </button>

            {/* DINEOUT Card */}
            <button
              type="button"
              onClick={() => scrollToLive('dineout')}
              className={`text-left bg-white dark:bg-[#221B17] text-[#24140E] dark:text-[#FAF3EB] rounded-[22px] p-5 sm:p-6 shadow-xl shadow-black/10 hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[188px] cursor-pointer ${
                orderModeBanner === 'dineout' ? 'ring-2 ring-white/80' : ''
              }`}
            >
              <div>
                <h2 className="text-[21px] font-extrabold tracking-tight leading-none">
                  {t.dineout}
                </h2>
                <p className="mt-1.5 text-[12px] font-bold tracking-wide text-[#7E6B62] dark:text-[#B8A79D]">
                  EAT OUT &amp; SAVE MORE
                </p>
                <span className="mt-3 inline-block px-2.5 py-1 rounded-md bg-[#FFF1EB] dark:bg-[#39211A] text-[#E23428] text-[11px] font-extrabold tracking-wide">
                  UPTO 50% OFF
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-2">
                <span className="w-10 h-10 rounded-full bg-[#E23428] text-white flex items-center justify-center shadow-md shadow-[#E23428]/30">
                  <ArrowRight className="w-5 h-5" />
                </span>
                <DineoutPlateArt />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Active Order Banner (if customer has an ongoing order) */}
      {latestActiveOrder && (
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-[#24140E] text-white rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-[#E23428] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <div>
                <div className="text-sm font-bold">
                  Live Order {latestActiveOrder.orderNumber} &middot; {latestActiveOrder.stallName}
                </div>
                <div className="text-xs text-[#DFC8BA] flex items-center gap-2">
                  <span>Status: <strong className="text-[#FBBF24] capitalize">{latestActiveOrder.status.replace('_', ' ')}</strong></span>
                  <span>&middot;</span>
                  <span>Handover code: <strong className="font-mono text-white tracking-wider">{latestActiveOrder.deliveryCode}</strong></span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTrackerOrderId(latestActiveOrder.id)}
              className="px-4 py-2 rounded-xl bg-white text-[#24140E] text-xs font-extrabold hover:bg-[#FFF3E6] transition-colors cursor-pointer whitespace-nowrap"
            >
              Track live order
            </button>
          </div>
        </div>
      )}

      {/* LIVE STALLS & COLLECTIONS SECTION — Screenshots 4 & 5 */}
      <main id="live" className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-8 flex-1">
        {/* Category Segmented Tabs */}
        <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-[#F3EAE0] dark:bg-[#241C18] border border-[#E9DEC8] dark:border-[#382C26]">
          <button
            type="button"
            onClick={() => setCategoryTab('all')}
            className={`px-4 py-2 rounded-xl text-[13.5px] font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              categoryTab === 'all'
                ? 'bg-white dark:bg-[#352A24] text-[#24140E] dark:text-white shadow-sm'
                : 'text-[#5C4940] dark:text-[#B8A79D] hover:text-[#24140E]'
            }`}
          >
            <span>🍽️</span> All stalls
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab('food')}
            className={`px-4 py-2 rounded-xl text-[13.5px] font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              categoryTab === 'food'
                ? 'bg-white dark:bg-[#352A24] text-[#24140E] dark:text-white shadow-sm'
                : 'text-[#5C4940] dark:text-[#B8A79D] hover:text-[#24140E]'
            }`}
          >
            <span>🍛</span> Food
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab('vegetables')}
            className={`px-4 py-2 rounded-xl text-[13.5px] font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              categoryTab === 'vegetables'
                ? 'bg-white dark:bg-[#352A24] text-[#24140E] dark:text-white shadow-sm'
                : 'text-[#5C4940] dark:text-[#B8A79D] hover:text-[#24140E]'
            }`}
          >
            <span>🥬</span> Vegetables
          </button>
        </div>

        {/* Collections */}
        <section className="mt-7">
          <h2 className="text-[24px] font-extrabold tracking-tight text-[#24140E] dark:text-[#FAF3EB]">
            {t.collections}
          </h2>
          <div className="mt-1.5 w-10 h-1 rounded-full bg-[#F58220]" />
          <p className="mt-2.5 text-[14px] text-[#6E5B52] dark:text-[#B8A79D]">
            Explore what&apos;s selling live around your location right now.
          </p>

          <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {collections.map((col) => {
              const active = collectionFilter === col.name;
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() =>
                    setCollectionFilter(active ? null : col.name)
                  }
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all shrink-0 min-w-[165px] text-left cursor-pointer ${
                    active
                      ? 'bg-[#FFF3EC] dark:bg-[#38231B] border-[#E23428] shadow-sm'
                      : 'bg-white dark:bg-[#221B17] border-[#EBE1D6] dark:border-[#382C26] hover:border-[#DFB8A4]'
                  }`}
                >
                  <ThelaCartIcon className="w-8 h-8 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-[#24140E] dark:text-[#FAF3EB] truncate max-w-[130px]">
                      {col.name}
                    </div>
                    <div className="text-[12px] text-[#7D6A60] dark:text-[#A9988E]">
                      {col.count} {col.count === 1 ? 'stall' : 'stalls'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter & Sort Bar (Screenshot 4) */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setRating4Plus((v) => !v)}
              className={`px-3.5 py-2 rounded-full text-[13px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                rating4Plus
                  ? 'bg-[#24140E] text-white border-[#24140E] dark:bg-[#E23428] dark:border-[#E23428]'
                  : 'bg-white dark:bg-[#221B17] text-[#3B2B24] dark:text-[#E5D7CE] border-[#E4D9CE] dark:border-[#3C302A] hover:border-[#C9B9AA]'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              Rating 4.0+
            </button>

            <button
              type="button"
              onClick={() => setWithin1Km((v) => !v)}
              className={`px-3.5 py-2 rounded-full text-[13px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                within1Km
                  ? 'bg-[#24140E] text-white border-[#24140E] dark:bg-[#E23428] dark:border-[#E23428]'
                  : 'bg-white dark:bg-[#221B17] text-[#3B2B24] dark:text-[#E5D7CE] border-[#E4D9CE] dark:border-[#3C302A] hover:border-[#C9B9AA]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#E23428]" />
              Within 1 km
            </button>

            <span className="text-[13px] text-[#7D6A60] dark:text-[#A9988E] ml-1">
              Sort:
            </span>

            <button
              type="button"
              onClick={() => setSortBy('nearest')}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                sortBy === 'nearest'
                  ? 'bg-[#D93025] text-white shadow-sm'
                  : 'bg-white dark:bg-[#221B17] border border-[#E4D9CE] dark:border-[#3C302A] text-[#3B2B24] dark:text-[#E5D7CE]'
              }`}
            >
              Nearest
            </button>

            <button
              type="button"
              onClick={() => setSortBy('top_rated')}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                sortBy === 'top_rated'
                  ? 'bg-[#D93025] text-white shadow-sm'
                  : 'bg-white dark:bg-[#221B17] border border-[#E4D9CE] dark:border-[#3C302A] text-[#3B2B24] dark:text-[#E5D7CE]'
              }`}
            >
              Top rated
            </button>

            {(collectionFilter || searchQuery || rating4Plus || within1Km) && (
              <button
                type="button"
                onClick={() => {
                  setCollectionFilter(null);
                  setSearchQuery('');
                  setRating4Plus(false);
                  setWithin1Km(false);
                  setCategoryTab('all');
                }}
                className="text-xs font-bold text-[#E23428] hover:underline ml-1 cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={detectUserLocation}
            className="px-4 py-2 rounded-full bg-white dark:bg-[#221B17] border border-[#E4D9CE] dark:border-[#3C302A] text-[13px] font-bold text-[#24140E] dark:text-[#FAF3EB] hover:border-[#E23428] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5 text-[#E23428]" />
            Use my location
          </button>
        </div>

        {/* Stalls Near You + Map Split (Screenshots 4 & 5) */}
        <section className="mt-7">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[22px] font-extrabold tracking-tight text-[#24140E] dark:text-[#FAF3EB]">
                {t.stallsNearYou}
              </h2>
              <div className="mt-1 text-[13px] text-[#6E5B52] dark:text-[#B8A79D] space-y-0.5">
                <p>
                  {filteredStalls.length}{' '}
                  {filteredStalls.length === 1 ? 'stall' : 'stalls'} live near you
                  {orderModeBanner === 'dineout' && ' · Dineout pickup offers active'}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E23428]" />
                  Live location on &middot; &plusmn;{gpsAccuracyMeters} m &middot; showing stalls
                  within 5 km
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Stall Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStalls.length === 0 ? (
                <div className="sm:col-span-2 bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-2xl p-8 text-center">
                  <Store className="w-10 h-10 text-[#C8B7AC] mx-auto mb-3" />
                  <h3 className="text-base font-extrabold">No live stalls match those filters</h3>
                  <p className="mt-1 text-sm text-[#6E5B52] dark:text-[#B8A79D]">
                    Try expanding beyond 1 km or clearing your active collection filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCollectionFilter(null);
                      setSearchQuery('');
                      setRating4Plus(false);
                      setWithin1Km(false);
                      setCategoryTab('all');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#E23428] text-white text-sm font-bold cursor-pointer"
                  >
                    Show all live stalls
                  </button>
                </div>
              ) : (
                filteredStalls.map((stall) => {
                  const minPrice =
                    stall.menu.length > 0
                      ? Math.min(...stall.menu.map((m) => m.price))
                      : 20;
                  const isFav = favorites.includes(stall.id);
                  const isFocused = focusedStallId === stall.id;

                  return (
                    <article
                      key={stall.id}
                      onClick={() => setOpenMenuStall(stall)}
                      className={`group bg-white dark:bg-[#221B17] rounded-[20px] border overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col ${
                        isFocused
                          ? 'border-[#E23428] ring-2 ring-[#E23428]/20'
                          : 'border-[#EAE0D5] dark:border-[#382C26]'
                      }`}
                    >
                      {/* Cover photo */}
                      <div className="relative h-44 bg-[#2A1E1A] overflow-hidden">
                        {stall.photos[0] ? (
                          <img
                            src={stall.photos[0]}
                            alt={stall.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            {stall.pinEmoji}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                        {/* Live now badge (Screenshot 5) */}
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 text-[#1F2937] text-[11.5px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                          Live now
                        </span>

                        {stall.isOwnerStall && (
                          <span className="absolute top-3 right-3 bg-[#24140E]/90 text-[#FBBF24] text-[11px] font-bold px-2.5 py-1 rounded-full">
                            Your Stall
                          </span>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-[15.5px] font-extrabold text-[#24140E] dark:text-[#FAF3EB] truncate">
                              {stall.name}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="inline-flex items-center gap-0.5 bg-[#F58220] text-white text-[11.5px] font-extrabold px-1.5 py-0.5 rounded-md tabular-nums">
                                {stall.rating.toFixed(1)} ★
                              </span>
                              <span className="text-[11.5px] text-[#7D6A60] dark:text-[#A9988E] tabular-nums">
                                ({stall.reviewCount})
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(stall.id);
                                }}
                                aria-label="Toggle favorite stall"
                                className="w-7 h-7 rounded-full border border-[#E8DED4] dark:border-[#3F322B] flex items-center justify-center hover:border-[#E23428] cursor-pointer"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    isFav
                                      ? 'text-[#E23428] fill-[#E23428]'
                                      : 'text-[#8C7A70]'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="mt-1.5 flex items-baseline justify-between gap-2">
                            <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D] line-clamp-1">
                              {stall.shortDescription}
                            </p>
                            <span className="text-[12.5px] font-bold text-[#24140E] dark:text-[#FAF3EB] whitespace-nowrap tabular-nums">
                              From ₹{minPrice}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#F4ECE3] dark:border-[#322721] flex items-center justify-between text-[12.5px]">
                          <span className="text-[#6E5B52] dark:text-[#B8A79D] tabular-nums">
                            {stall.distanceKm} km &middot; serving
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusedStallId(stall.id);
                            }}
                            className="inline-flex items-center gap-1 font-extrabold text-[#D93025] hover:underline cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Map
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Right Column: Live Interactive Leaflet Map */}
            <div className="lg:col-span-6 lg:sticky lg:top-28">
              <LiveStallMap
                userCoords={userCoords}
                stalls={filteredStalls}
                selectedStallId={focusedStallId}
                onSelectStall={(stall) => {
                  setFocusedStallId(stall.id);
                  setOpenMenuStall(stall);
                }}
                onLocateMe={detectUserLocation}
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS — Screenshot 12 */}
        <section
          id="how"
          className="mt-16 pt-10 border-t border-[#EAE0D5] dark:border-[#322721]"
        >
          <h2 className="text-[24px] font-extrabold tracking-tight text-[#24140E] dark:text-[#FAF3EB]">
            {t.howItWorks}
          </h2>
          <div className="mt-1.5 w-10 h-1 rounded-full bg-[#F58220]" />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-6 shadow-xs">
              <div className="text-2xl mb-3">📍</div>
              <h3 className="text-[15.5px] font-extrabold text-[#24140E] dark:text-[#FAF3EB]">
                1 &middot; Spot
              </h3>
              <p className="mt-2 text-[13.5px] text-[#6E5B52] dark:text-[#B8A79D] leading-relaxed">
                See every thela and vegetable cart move live on the map, updated every second.
              </p>
            </div>

            <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-6 shadow-xs">
              <div className="text-2xl mb-3">🧾</div>
              <h3 className="text-[15.5px] font-extrabold text-[#24140E] dark:text-[#FAF3EB]">
                2 &middot; Pre-order &amp; prepay
              </h3>
              <p className="mt-2 text-[13.5px] text-[#6E5B52] dark:text-[#B8A79D] leading-relaxed">
                Pick your items and pay upfront: item cost plus a flat 5% platform fee, via UPI,
                card or netbanking.
              </p>
            </div>

            <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-6 shadow-xs">
              <div className="text-2xl mb-3">🛍️</div>
              <h3 className="text-[15.5px] font-extrabold text-[#24140E] dark:text-[#FAF3EB]">
                3 &middot; Get delivered
              </h3>
              <p className="mt-2 text-[13.5px] text-[#6E5B52] dark:text-[#B8A79D] leading-relaxed">
                Follow your rider from stall acceptance to doorstep delivery with a 4-digit handover
                code.
              </p>
            </div>
          </div>
        </section>

        {/* HELP CENTRE — Screenshot 12 */}
        <section
          id="help-centre"
          className="mt-14 pt-10 border-t border-[#EAE0D5] dark:border-[#322721]"
        >
          <p className="text-[11px] font-bold tracking-widest text-[#7D6A60] dark:text-[#A9988E]">
            HELP CENTRE
          </p>
          <h2 className="mt-1 text-[24px] font-extrabold tracking-tight text-[#24140E] dark:text-[#FAF3EB]">
            {t.helpTitle}
          </h2>
          <div className="mt-1.5 w-10 h-1 rounded-full bg-[#F58220]" />

          {/* FAQ Tabs */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {(
              [
                { id: 'ordering', label: 'Ordering', emoji: '🍽️' },
                { id: 'owners', label: 'Stall owners', emoji: '🧑‍🍳' },
                { id: 'partners', label: 'Delivery partners', emoji: '🛵' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFaqCategory(tab.id);
                  setOpenFaqIndex(0);
                }}
                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  faqCategory === tab.id
                    ? 'bg-[#D93025] text-white shadow-sm'
                    : 'bg-white dark:bg-[#221B17] border border-[#E4D9CE] dark:border-[#3C302A] text-[#3B2B24] dark:text-[#E5D7CE]'
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="mt-5 max-w-[680px] space-y-3">
            {FAQ_DATA[faqCategory].map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.q}
                  className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-2xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-bold text-[14.5px] text-[#24140E] dark:text-[#FAF3EB] cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <span className="text-[#D93025] text-lg font-extrabold leading-none">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-[13.5px] text-[#6E5B52] dark:text-[#B8A79D] leading-relaxed border-t border-[#F4ECE3] dark:border-[#322721] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <MovanaFooter />

      {/* Bottom Red PWA Install Banner (Screenshots 3, 4, 5) */}
      {showInstallBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#C9261E] text-white border-t border-white/15 shadow-2xl">
          <div className="max-w-[980px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 sm:pl-44">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-extrabold truncate">
                  Install Movana App
                </div>
                <div className="text-[11.5px] text-white/85 truncate">
                  Add to your home screen for the fastest ordering experience
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setInstallModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#F4C44E] hover:bg-[#EBB636] text-[#24140E] text-[13px] font-extrabold transition-colors cursor-pointer"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setShowInstallBanner(false)}
                aria-label="Dismiss install banner"
                className="p-2 text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STALL MENU & ORDER MODAL */}
      {openMenuStall && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-[#FDF8F0] dark:bg-[#1E1714] rounded-[24px] shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            {/* Banner Photo */}
            <div className="relative h-48 bg-[#2A1E1A] shrink-0">
              {openMenuStall.photos[0] && (
                <img
                  src={openMenuStall.photos[0]}
                  alt={openMenuStall.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                type="button"
                onClick={() => setOpenMenuStall(null)}
                aria-label="Close stall menu"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{openMenuStall.pinEmoji}</span>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    {openMenuStall.name}
                  </h3>
                </div>
                <p className="text-xs text-white/85 mt-1">
                  {openMenuStall.address} &middot; {openMenuStall.foodType} &middot; ★{' '}
                  {openMenuStall.rating.toFixed(1)} ({openMenuStall.reviewCount})
                </p>
              </div>
            </div>

            {/* Stall Metadata Strip */}
            <div className="px-5 py-3 bg-white dark:bg-[#251D19] border-b border-[#EDE3D8] dark:border-[#382C26] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E5B52] dark:text-[#B8A79D]">
              <div className="flex flex-wrap items-center gap-3">
                <span>Allergens: {openMenuStall.allergens || 'Ask vendor'}</span>
                {openMenuStall.fssaiNumber && (
                  <span className="font-mono">FSSAI: {openMenuStall.fssaiNumber}</span>
                )}
              </div>
              {openMenuStall.publicPhone && (
                <span className="inline-flex items-center gap-1 font-bold text-[#24140E] dark:text-[#FAF3EB]">
                  <Phone className="w-3.5 h-3.5 text-[#E23428]" />
                  {openMenuStall.publicPhone}
                </span>
              )}
            </div>

            {/* Menu List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#6E5B52] dark:text-[#B8A79D]">
                  Live Menu ({openMenuStall.menu.length} items)
                </h4>
                {openMenuStall.upiId && (
                  <span className="text-xs font-mono text-[#16A34A] font-semibold">
                    UPI: {openMenuStall.upiId}
                  </span>
                )}
              </div>

              {openMenuStall.menu.length === 0 ? (
                <p className="text-sm text-[#6E5B52] py-6 text-center">
                  This stall hasn&apos;t added menu items yet.
                </p>
              ) : (
                openMenuStall.menu.map((item) => {
                  const inCart = cart.find((c) => c.menuItem.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#251D19] border border-[#EAE0D5] dark:border-[#382C26] rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                              item.isVeg ? 'border-[#16A34A]' : 'border-[#DC2626]'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.isVeg ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                              }`}
                            />
                          </span>
                          <span className="font-extrabold text-[15px] text-[#24140E] dark:text-[#FAF3EB]">
                            {item.name}
                          </span>
                          <span className="text-xs text-[#8C7A70]">{item.category}</span>
                        </div>
                        {item.description && (
                          <p className="mt-1 text-xs text-[#6E5B52] dark:text-[#B8A79D] leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-2 font-mono text-sm font-bold text-[#24140E] dark:text-[#FAF3EB] tabular-nums">
                          ₹{item.price}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {inCart ? (
                          <div className="inline-flex items-center gap-2 bg-[#FFF1EB] dark:bg-[#3A221A] border border-[#E23428] rounded-xl px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center text-[#E23428] font-bold cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-5 text-center text-sm font-extrabold text-[#E23428] tabular-nums">
                              {inCart.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center text-[#E23428] font-bold cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(openMenuStall.id, item)}
                            className="px-4 py-2 rounded-xl bg-[#E23428] hover:bg-[#C9261E] text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Sticky Bar inside Menu Modal */}
            {cart.length > 0 && (
              <div className="px-5 py-3.5 bg-white dark:bg-[#251D19] border-t border-[#EAE0D5] dark:border-[#382C26] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                    {cart.reduce((s, c) => s + c.quantity, 0)} items in cart
                  </div>
                  <div className="text-base font-extrabold font-mono tabular-nums">
                    ₹{cartSubtotal} + 5% platform fee
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuStall(null);
                    setCartDrawerOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl movana-btn-gradient text-white text-sm font-extrabold shadow-md cursor-pointer"
                >
                  View Cart &amp; Checkout &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CART & CHECKOUT SLIDE-OVER DRAWER */}
      {cartDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/55 flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#FDF8F0] dark:bg-[#1E1714] h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 bg-white dark:bg-[#251D19] border-b border-[#EAE0D5] dark:border-[#382C26] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold">Your Móvana Cart</h3>
                {cartStall && (
                  <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                    Ordering from <strong>{cartStall.name}</strong>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close cart"
                className="p-2 rounded-xl hover:bg-[#F5ECE2] dark:hover:bg-[#332720] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF1EB] dark:bg-[#33211B] flex items-center justify-center text-3xl mb-4">
                  🛒
                </div>
                <h4 className="text-base font-extrabold">Your cart is empty</h4>
                <p className="mt-1 text-sm text-[#6E5B52] dark:text-[#B8A79D]">
                  Tap any live street-food stall or vegetable cart to add fresh items.
                </p>
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(false)}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[#E23428] text-white text-sm font-bold cursor-pointer"
                >
                  Browse live stalls
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleCheckoutSubmit}
                className="flex-1 overflow-y-auto p-5 space-y-5"
              >
                {/* Mode Toggle: Delivery vs Dineout Pickup */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F0E6DA] dark:bg-[#2B221D]">
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('delivery')}
                    className={`py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                      checkoutMode === 'delivery'
                        ? 'bg-white dark:bg-[#3D312A] text-[#E23428] shadow-xs'
                        : 'text-[#6E5B52] dark:text-[#B8A79D]'
                    }`}
                  >
                    🛵 Doorstep Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('dineout')}
                    className={`py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                      checkoutMode === 'dineout'
                        ? 'bg-white dark:bg-[#3D312A] text-[#E23428] shadow-xs'
                        : 'text-[#6E5B52] dark:text-[#B8A79D]'
                    }`}
                  >
                    🍽️ Dineout / Pickup
                  </button>
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-[#251D19] rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#6E5B52]">
                    <span>Items</span>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[#E23428] inline-flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>
                  {cart.map((c) => (
                    <div
                      key={c.menuItem.id}
                      className="flex items-center justify-between gap-3 pt-2 border-t border-[#F4ECE3] dark:border-[#332720]"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{c.menuItem.name}</div>
                        <div className="text-xs font-mono text-[#6E5B52] dark:text-[#B8A79D] tabular-nums">
                          ₹{c.menuItem.price} &times; {c.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(c.menuItem.id, -1)}
                          className="w-7 h-7 rounded-lg border border-[#E5DBD0] dark:border-[#42352E] flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-4 text-center text-xs font-extrabold tabular-nums">
                          {c.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(c.menuItem.id, 1)}
                          className="w-7 h-7 rounded-lg border border-[#E5DBD0] dark:border-[#42352E] flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Details */}
                <div className="bg-white dark:bg-[#251D19] rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] p-4 space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#6E5B52]">
                    Contact &amp; {checkoutMode === 'delivery' ? 'Delivery' : 'Pickup'} Details
                  </div>
                  <input
                    type="text"
                    required
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D9CE] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                  />
                  <input
                    type="tel"
                    required
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    placeholder="10-digit phone number (required)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D9CE] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm font-mono"
                  />
                  {checkoutMode === 'delivery' && (
                    <textarea
                      rows={2}
                      required
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      placeholder="House no., street, landmark"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D9CE] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                    />
                  )}
                </div>

                {/* Payment Method (Simulated UPI/Card/Netbanking) */}
                <div className="bg-white dark:bg-[#251D19] rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] p-4 space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#6E5B52]">
                    Prepay Upfront (Demo Simulated)
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['UPI', 'Card', 'Netbanking'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                          paymentMethod === method
                            ? 'border-[#E23428] bg-[#FFF2EC] dark:bg-[#3A221A] text-[#E23428]'
                            : 'border-[#E4D9CE] dark:border-[#3E322B]'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                  {paymentMethod === 'UPI' && cartStall?.upiId && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FDF6EB] dark:bg-[#2F251E] border border-[#EFE1CE] dark:border-[#43352D]">
                      <QrCode className="w-8 h-8 text-[#E23428] shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold">Direct Stall UPI Ready</div>
                        <div className="font-mono text-[#6E5B52] dark:text-[#B8A79D]">
                          {cartStall.upiId} &middot; Auto-filled ₹{cartTotal}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-white dark:bg-[#251D19] rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[#6E5B52] dark:text-[#B8A79D]">
                    <span>Item total</span>
                    <span className="font-mono tabular-nums">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#6E5B52] dark:text-[#B8A79D]">
                    <span>Flat 5% Móvana platform fee</span>
                    <span className="font-mono tabular-nums">₹{cartPlatformFee}</span>
                  </div>
                  <div className="flex justify-between text-[#6E5B52] dark:text-[#B8A79D]">
                    <span>{checkoutMode === 'delivery' ? 'Rider delivery fee' : 'Stall pickup'}</span>
                    <span className="font-mono tabular-nums">
                      {cartDeliveryFee === 0 ? 'FREE' : `₹${cartDeliveryFee}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#F0E6DC] dark:border-[#382C26] flex justify-between font-extrabold text-base">
                    <span>To Pay</span>
                    <span className="font-mono tabular-nums text-[#E23428]">₹{cartTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl movana-btn-gradient text-white font-extrabold text-sm shadow-lg cursor-pointer"
                >
                  Pay ₹{cartTotal} &amp; Place Order
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LIVE ORDER TRACKER MODAL (4-digit handover code) */}
      {trackedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#221B17] rounded-[24px] shadow-2xl p-6 max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E23428]">
                  Order {trackedOrder.orderNumber}
                </span>
                <h3 className="text-xl font-extrabold mt-0.5">
                  {trackedOrder.stallName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTrackerOrderId(null)}
                className="p-2 rounded-xl hover:bg-[#F5ECE2] dark:hover:bg-[#332720] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Digit Code Card */}
            <div className="mt-4 rounded-2xl bg-[#24140E] text-white p-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#F6C86E] font-bold">
                  4-Digit Handover Code
                </div>
                <p className="text-xs text-[#D4C2B7] mt-1">
                  Share this code with your rider or stall owner only when you receive your order.
                </p>
              </div>
              <div className="font-mono text-3xl font-extrabold tracking-[0.2em] bg-white/10 px-4 py-2 rounded-xl tabular-nums shrink-0">
                {trackedOrder.deliveryCode}
              </div>
            </div>

            {/* Stepper */}
            <div className="mt-5 space-y-3">
              {(
                [
                  { key: 'placed', label: 'Order prepaid & sent to stall' },
                  { key: 'accepted', label: 'Accepted by stall owner' },
                  { key: 'preparing', label: 'Freshly preparing at thela' },
                  { key: 'ready', label: 'Ready for pickup' },
                  { key: 'picked_up', label: 'Rider on the way to you' },
                  { key: 'delivered', label: 'Delivered & code verified' },
                ] as const
              ).map((step, i) => {
                const statusOrder = [
                  'placed',
                  'accepted',
                  'preparing',
                  'ready',
                  'picked_up',
                  'delivered',
                ];
                const currentIndex = statusOrder.indexOf(trackedOrder.status);
                const done = currentIndex >= i && trackedOrder.status !== 'cancelled';
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        done
                          ? 'bg-[#16A34A] text-white'
                          : 'bg-[#F0E6DA] dark:bg-[#332720] text-[#8C7A70]'
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </span>
                    <span
                      className={`text-sm ${
                        done ? 'font-bold' : 'text-[#8C7A70]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Order Items Summary */}
            <div className="mt-5 pt-4 border-t border-[#EFE6DC] dark:border-[#382C26] text-xs space-y-1.5 text-[#6E5B52] dark:text-[#B8A79D]">
              {trackedOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>
                    {it.quantity} &times; {it.name}
                  </span>
                  <span className="font-mono tabular-nums">₹{it.price * it.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-[#24140E] dark:text-white pt-1.5 border-t border-[#F4ECE3] dark:border-[#332720]">
                <span>Total Paid ({trackedOrder.paymentMethod})</span>
                <span className="font-mono tabular-nums">₹{trackedOrder.total}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              {trackedOrder.status === 'placed' || trackedOrder.status === 'accepted' ? (
                <button
                  type="button"
                  onClick={() => updateOrderStatus(trackedOrder.id, 'cancelled')}
                  className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                >
                  Cancel order
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-[#6E5B52]">
                  <Clock className="w-3.5 h-3.5" /> Live sync enabled across roles
                </span>
              )}
              <button
                type="button"
                onClick={() => setActiveTrackerOrderId(null)}
                className="px-4 py-2 rounded-xl bg-[#24140E] text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA INSTALL MODAL */}
      {installModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#221B17] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Install Móvana App</h3>
              <button
                type="button"
                onClick={() => setInstallModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F5ECE2] dark:hover:bg-[#332720] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-[#6E5B52] dark:text-[#B8A79D] leading-relaxed">
              Add Móvana to your home screen for one-tap access to live street food thelas, instant
              order tracking, and stall owner GPS updates.
            </p>
            <ol className="mt-4 space-y-2 text-sm text-[#3B2B24] dark:text-[#E5D7CE] list-decimal list-inside">
              <li>Open your browser menu (Chrome &vellip; or Safari Share icon).</li>
              <li>Tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
              <li>Launch Móvana directly like a native app!</li>
            </ol>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setInstallModalOpen(false);
                  setShowInstallBanner(false);
                  showToast('Móvana shortcut saved for quick launch!', 'success');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#E23428] text-white text-sm font-bold cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
