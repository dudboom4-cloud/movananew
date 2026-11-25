import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Upload,
} from 'lucide-react';
import { useMovana } from '../context/MovanaContext';
import { MovanaLogo } from './BrandAssets';

export function DeliveryPartnerPage() {
  const {
    navigateToRole,
    setShowRolePicker,
    userAccount,
    setAuthModalOpen,
    deliveryProfile,
    updateDeliveryProfile,
    submitDeliveryProfileForApproval,
    toggleDeliveryOnline,
    orders,
    assignOrderToRider,
    updateOrderStatus,
    completeDeliveryWithCode,
    showToast,
  } = useMovana();

  const [showHistory, setShowHistory] = useState(true);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  // Compute live delivery queues & metrics
  const deliveryOrders = orders.filter((o) => o.mode === 'delivery');
  const activeDelivery = deliveryOrders.find(
    (o) =>
      o.riderId === 'partner-self' &&
      o.status !== 'delivered' &&
      o.status !== 'cancelled'
  );
  const openRequests = deliveryOrders.filter(
    (o) =>
      !o.riderId &&
      (o.status === 'placed' ||
        o.status === 'accepted' ||
        o.status === 'preparing' ||
        o.status === 'ready')
  );
  const completedDeliveries = deliveryOrders.filter(
    (o) => o.riderId === 'partner-self' && o.status === 'delivered'
  );

  const isApproved = deliveryProfile.verificationStatus === 'approved';
  const isPending = deliveryProfile.verificationStatus === 'pending';

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateDeliveryProfile({
        aadhaarPhoto: String(reader.result),
        aadhaarLast4: deliveryProfile.aadhaarLast4 || '6429',
      });
      showToast('Aadhaar document attached for admin check.', 'info');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-[#161210] text-[#24140E] dark:text-[#FAF3EB] flex flex-col">
      {/* Clean Light Top Header matching Screenshot 11 */}
      <header className="sticky top-0 z-40 bg-[#FDFBF8]/95 dark:bg-[#1C1613]/95 backdrop-blur-sm border-b border-[#EDE3D8] dark:border-[#322721]">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowRolePicker(true)}
            className="cursor-pointer"
          >
            <MovanaLogo variant="brand" />
          </button>

          {/* Segmented Role Pill: Open as | Customer | Stall owner | Delivery partner */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#F4ECE3] dark:bg-[#271F1B] border border-[#E8DDD1] dark:border-[#3A2E27] rounded-full px-2 py-1 text-[12.5px]">
            <span className="px-2 text-[#8C7A70] font-medium">Open as</span>
            <button
              type="button"
              onClick={() => navigateToRole('customer')}
              className="px-3 py-1 rounded-full font-bold text-[#4A372E] dark:text-[#D9C7BD] hover:bg-white/70 dark:hover:bg-[#352A24] transition-colors cursor-pointer"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => navigateToRole('vendor')}
              className="px-3 py-1 rounded-full font-bold text-[#4A372E] dark:text-[#D9C7BD] hover:bg-white/70 dark:hover:bg-[#352A24] transition-colors cursor-pointer"
            >
              Stall owner
            </button>
            <button
              type="button"
              onClick={() => navigateToRole('delivery')}
              className="px-3.5 py-1 rounded-full font-bold bg-[#C9261E] text-white shadow-xs cursor-pointer"
            >
              Delivery partner
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-1.5 rounded-xl border border-[#DDD2C6] dark:border-[#3E322B] bg-white dark:bg-[#251D19] text-[13px] font-bold hover:border-[#C9261E] transition-colors cursor-pointer whitespace-nowrap"
            >
              {userAccount.signedIn ? userAccount.name.split(' ')[0] : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => navigateToRole('customer')}
              className="text-[13px] font-semibold text-[#5B4940] dark:text-[#CFC0B7] hover:text-[#E23428] cursor-pointer whitespace-nowrap"
            >
              Customer app
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1040px] w-full mx-auto px-4 sm:px-6 py-7 space-y-5 flex-1 pb-24">
        {/* Top Row: Dark Status Hero Card + 4 White Metric Cards (Screenshot 11) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Dark Hero Status Card */}
          <section className="lg:col-span-6 rounded-[22px] bg-[#1C1713] text-white p-6 relative overflow-hidden flex flex-col justify-between shadow-lg">
            {/* Warm golden ambient orb matching Screenshot 11 */}
            <div
              className="pointer-events-none absolute -top-12 -right-8 w-44 h-44 rounded-full bg-[#B47B1B]/45 blur-xl"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="text-[11px] font-bold tracking-[0.14em] text-[#C5B4A8]">
                MÓVANA DELIVERY PARTNER
              </p>
              <h1 className="mt-1.5 text-[28px] font-extrabold tracking-tight">
                {deliveryProfile.isOnline ? "You're online" : "You're offline"}
              </h1>
              <p className="mt-1 text-[13px] text-[#B8A79D]">
                {isApproved
                  ? deliveryProfile.isOnline
                    ? 'Receiving live pickup requests from verified stalls near you.'
                    : 'Your vehicle is approved. Toggle online to start accepting trips.'
                  : 'Vehicle registration is awaiting admin approval.'}
              </p>
            </div>

            <div className="relative mt-5 space-y-2.5">
              {/* Toggle Bar */}
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[13px] font-bold">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      deliveryProfile.isOnline
                        ? 'bg-[#22C55E]'
                        : isApproved
                          ? 'bg-[#FBBF24]'
                          : 'bg-[#94A3B8]'
                    }`}
                  />
                  <span>
                    {!isApproved
                      ? 'Vehicle approval required'
                      : deliveryProfile.isOnline
                        ? 'Online for pickups'
                        : 'Go online now'}
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={deliveryProfile.isOnline}
                  onClick={toggleDeliveryOnline}
                  className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
                    deliveryProfile.isOnline
                      ? 'bg-[#22C55E]'
                      : 'bg-white/25'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      deliveryProfile.isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Status pill bar */}
              <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-2.5 text-[12px] text-[#E5D7CE] flex flex-wrap items-center justify-between gap-2">
                <span>
                  {isApproved
                    ? '✅ Vehicle approved — ready for hyperlocal thela deliveries.'
                    : isPending
                      ? '⏳ Vehicle registration submitted — waiting for admin approval.'
                      : '📝 Complete Partner profile below to submit your vehicle.'}
                </span>
                {!isApproved && (
                  <button
                    type="button"
                    onClick={() => navigateToRole('admin')}
                    className="text-[#FBBF24] font-bold underline underline-offset-2 cursor-pointer"
                  >
                    Admin approval &rarr;
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 4 Metric Cards (Screenshot 11) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-4 flex flex-col justify-center">
              <div className="text-[12px] font-semibold text-[#7D6A60] dark:text-[#A9988E]">
                Today
              </div>
              <div className="mt-1.5 text-[28px] font-extrabold font-mono tabular-nums">
                {completedDeliveries.length}
              </div>
              <div className="text-[12px] text-[#7D6A60] dark:text-[#A9988E]">deliveries</div>
            </div>

            <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-4 flex flex-col justify-center">
              <div className="text-[12px] font-semibold text-[#7D6A60] dark:text-[#A9988E]">
                All time
              </div>
              <div className="mt-1.5 text-[28px] font-extrabold font-mono tabular-nums">
                {completedDeliveries.length}
              </div>
              <div className="text-[12px] text-[#7D6A60] dark:text-[#A9988E]">completed</div>
            </div>

            <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-4 flex flex-col justify-center">
              <div className="text-[12px] font-semibold text-[#7D6A60] dark:text-[#A9988E]">
                Open
              </div>
              <div className="mt-1.5 text-[28px] font-extrabold font-mono tabular-nums">
                {openRequests.length}
              </div>
              <div className="text-[12px] text-[#7D6A60] dark:text-[#A9988E]">requests now</div>
            </div>

            <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-4 flex flex-col justify-center">
              <div className="text-[12px] font-semibold text-[#7D6A60] dark:text-[#A9988E] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                Rating
              </div>
              <div className="mt-1.5 text-[26px] font-extrabold font-mono tabular-nums">
                {deliveryProfile.ratingCount > 0 ? deliveryProfile.rating.toFixed(1) : 'New'}
              </div>
              <div className="text-[12px] text-[#7D6A60] dark:text-[#A9988E]">
                {deliveryProfile.ratingCount > 0
                  ? `${deliveryProfile.ratingCount} ratings`
                  : 'no ratings yet'}
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Delivery Content Grid (Screenshot 11) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Active delivery + New requests + Delivery history */}
          <div className="lg:col-span-7 space-y-5">
            {/* Active Delivery */}
            <section className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[22px] p-5 sm:p-6 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-extrabold">Active delivery</h2>
                  <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                    Your current order, step by step.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F5ECE2] dark:bg-[#332720] text-[11.5px] font-bold text-[#6E5B52] dark:text-[#D5C3B7]">
                  {activeDelivery ? activeDelivery.orderNumber : 'No assignment'}
                </span>
              </div>

              {!activeDelivery ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[#DFC9B4] dark:border-[#4A3B31] bg-[#FDF9F3] dark:bg-[#1C1613] py-10 px-4 text-center">
                  <div className="text-3xl mb-2">🛵</div>
                  <div className="text-[14.5px] font-extrabold">No active delivery</div>
                  <p className="mt-1 text-[12.5px] text-[#7D6A60] dark:text-[#A9988E]">
                    Accept a request below to start your trip.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-[#F2D5B8] dark:border-[#4F3B2B] bg-[#FFFBF5] dark:bg-[#1E1713] p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase text-[#E23428]">
                        Pickup Stall
                      </div>
                      <div className="text-base font-extrabold">{activeDelivery.stallName}</div>
                      <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E23428]" />
                        {activeDelivery.stallAddress}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-[#16A34A]">
                      Earn ₹25
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#EFE3D5] dark:border-[#382C26]">
                    <div className="text-xs font-bold uppercase text-[#6E5B52]">
                      Drop-off Customer
                    </div>
                    <div className="text-sm font-extrabold mt-0.5">
                      {activeDelivery.customerName}
                    </div>
                    <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                      {activeDelivery.deliveryAddress}
                    </p>
                    <p className="mt-1 text-xs font-mono font-bold inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#E23428]" />
                      {activeDelivery.customerPhone}
                    </p>
                  </div>

                  {/* Step Actions */}
                  {activeDelivery.status !== 'picked_up' ? (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(activeDelivery.id, 'picked_up')}
                      className="w-full py-3 rounded-xl movana-btn-gradient text-white text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      Confirm Pickup from Stall
                    </button>
                  ) : (
                    <div className="rounded-xl bg-[#24140E] text-white p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5 text-[#FBBF24]">
                          <KeyRound className="w-4 h-4" />
                          Enter Customer&apos;s 4-Digit Code
                        </span>
                        <span className="text-[#C5B4A8] font-mono">
                          (Demo hint: {activeDelivery.deliveryCode})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={codeInputs[activeDelivery.id] || ''}
                          onChange={(e) =>
                            setCodeInputs((prev) => ({
                              ...prev,
                              [activeDelivery.id]: e.target.value.replace(/\D/g, ''),
                            }))
                          }
                          placeholder="4-digit code"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-base tracking-[0.25em] placeholder:tracking-normal placeholder:text-white/40"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            completeDeliveryWithCode(
                              activeDelivery.id,
                              codeInputs[activeDelivery.id] || ''
                            )
                          }
                          className="px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-extrabold whitespace-nowrap cursor-pointer"
                        >
                          Verify &amp; Deliver
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* New Requests (Screenshot 11) */}
            <section className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[22px] p-5 sm:p-6 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-extrabold">New requests</h2>
                  <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                    Pick-ups waiting for a rider near you.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F5ECE2] dark:bg-[#332720] text-[11.5px] font-bold text-[#6E5B52] dark:text-[#D5C3B7] tabular-nums">
                  {openRequests.length} live requests
                </span>
              </div>

              {!deliveryProfile.isOnline || openRequests.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-[#DFC9B4] dark:border-[#4A3B31] bg-[#FDF9F3] dark:bg-[#1C1613] py-10 px-4 text-center">
                  <div className="text-3xl mb-2">📡</div>
                  <div className="text-[14.5px] font-extrabold">Waiting for requests</div>
                  <p className="mt-1 text-[12.5px] text-[#7D6A60] dark:text-[#A9988E]">
                    {!deliveryProfile.isOnline
                      ? 'Go online to start receiving requests.'
                      : 'All nearby stall deliveries are currently assigned.'}
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {openRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] bg-[#FDFBF8] dark:bg-[#1C1613] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#E23428]">
                            {req.orderNumber}
                          </span>
                          <span className="text-sm font-extrabold">{req.stallName}</span>
                        </div>
                        <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                          Drop: {req.deliveryAddress}
                        </p>
                        <p className="text-xs text-[#7D6A60]">
                          {req.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={Boolean(activeDelivery)}
                        onClick={() => assignOrderToRider(req.id)}
                        className="px-4 py-2.5 rounded-xl bg-[#E23428] hover:bg-[#C9261E] disabled:opacity-40 text-white text-xs font-extrabold whitespace-nowrap cursor-pointer"
                      >
                        Accept trip (₹25)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Delivery History (Screenshot 11) */}
            <section className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[22px] p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-extrabold">Delivery history</h2>
                  <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                    Your completed trips.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory((v) => !v)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] text-xs font-bold hover:bg-[#FAF2E8] dark:hover:bg-[#332720] cursor-pointer"
                >
                  {showHistory ? 'Hide records' : 'Show records'}
                </button>
              </div>

              {showHistory && (
                <div className="mt-4 space-y-2.5">
                  {completedDeliveries.length === 0 ? (
                    <div className="rounded-xl bg-[#FDF9F3] dark:bg-[#1C1613] border border-[#EFE6DC] dark:border-[#382C26] py-6 text-center text-xs text-[#7D6A60]">
                      No completed trips yet. Complete a delivery with the customer&apos;s 4-digit
                      code to log earnings here.
                    </div>
                  ) : (
                    completedDeliveries.map((trip) => (
                      <div
                        key={trip.id}
                        className="rounded-xl border border-[#EAE0D5] dark:border-[#382C26] px-4 py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-extrabold">
                            {trip.orderNumber} &middot; {trip.stallName}
                          </div>
                          <div className="text-[#6E5B52] dark:text-[#B8A79D]">
                            Delivered to {trip.customerName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-extrabold text-[#16A34A]">+₹25</div>
                          <div className="text-[#F59E0B] font-bold">5.0 ★</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Get started + Partner profile (Screenshot 11) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Get started 3 steps */}
            <section className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[22px] p-5 sm:p-6 shadow-xs">
              <h2 className="text-[16px] font-extrabold">Get started</h2>
              <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                Three steps to your first delivery.
              </p>

              <ol className="mt-4 space-y-4">
                <li className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      deliveryProfile.fullName
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#C9261E] text-white'
                    }`}
                  >
                    {deliveryProfile.fullName ? '✓' : '1'}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-extrabold">Register your vehicle</div>
                    <p className="text-[12px] text-[#6E5B52] dark:text-[#B8A79D]">
                      Sign in with Google and submit your details.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      isApproved
                        ? 'bg-[#16A34A] text-white'
                        : isPending
                          ? 'bg-[#F59E0B] text-white'
                          : 'bg-[#EFE6DC] dark:bg-[#332720] text-[#7D6A60]'
                    }`}
                  >
                    {isApproved ? '✓' : '2'}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-extrabold">Get approved</div>
                    <p className="text-[12px] text-[#6E5B52] dark:text-[#B8A79D]">
                      An admin checks your vehicle &amp; Aadhaar.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      deliveryProfile.isOnline
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#EFE6DC] dark:bg-[#332720] text-[#7D6A60]'
                    }`}
                  >
                    {deliveryProfile.isOnline ? '✓' : '3'}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-extrabold">Go online</div>
                    <p className="text-[12px] text-[#6E5B52] dark:text-[#B8A79D]">
                      Accept requests, pick up, deliver with the customer&apos;s code.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Partner Profile Form (Screenshot 11) */}
            <section className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[22px] p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-[16px] font-extrabold">Partner profile</h2>
                <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                  Private to your partner account.
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-bold mb-1">Full name</label>
                <input
                  type="text"
                  value={deliveryProfile.fullName}
                  onChange={(e) => updateDeliveryProfile({ fullName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold mb-1">Phone</label>
                <input
                  type="tel"
                  value={deliveryProfile.phone}
                  onChange={(e) => updateDeliveryProfile({ phone: e.target.value })}
                  placeholder="10-digit phone number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold mb-1">Vehicle</label>
                  <select
                    value={deliveryProfile.vehicleType}
                    onChange={(e) => updateDeliveryProfile({ vehicleType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                  >
                    <option value="">Choose vehicle</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Scooter / E-Bike">Scooter / E-Bike</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Electric Auto">Electric Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold mb-1">Registration / RC no.</label>
                  <input
                    type="text"
                    value={deliveryProfile.rcNumber}
                    onChange={(e) =>
                      updateDeliveryProfile({ rcNumber: e.target.value.toUpperCase() })
                    }
                    placeholder="DL 01 AB 1234"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm font-mono uppercase"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#8C7A70]">
                Used for admin verification. Customers never see this number.
              </p>

              {/* Aadhaar upload */}
              <div>
                <label className="block text-[12px] font-bold mb-1">
                  Aadhaar card photo (required)
                </label>
                <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-xs cursor-pointer hover:border-[#E23428]">
                  <Upload className="w-4 h-4 text-[#E23428]" />
                  <span>
                    {deliveryProfile.aadhaarPhoto
                      ? 'Aadhaar attached ✓'
                      : 'Upload Aadhaar photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAadhaarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={submitDeliveryProfileForApproval}
                className="w-full py-3 rounded-xl movana-btn-gradient text-white text-sm font-extrabold shadow-sm cursor-pointer"
              >
                {isApproved ? 'Update partner profile' : 'Submit for admin approval'}
              </button>

              {isApproved ? (
                <div className="flex items-center gap-2 text-xs text-[#16A34A] font-bold">
                  <ShieldCheck className="w-4 h-4" /> Approved by Móvana Company Admin
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-[#7D6A60]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Status: {deliveryProfile.verificationStatus}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateToRole('admin')}
                    className="font-bold text-[#E23428] hover:underline cursor-pointer"
                  >
                    Approve in Admin &rarr;
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
