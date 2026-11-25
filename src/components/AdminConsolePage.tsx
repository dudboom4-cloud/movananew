import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  ShieldCheck,
  Store,
  Truck,
  XCircle,
} from 'lucide-react';
import { useMovana } from '../context/MovanaContext';
import { MovanaLogo, ScallopedAwning } from './BrandAssets';

export function AdminConsolePage() {
  const {
    userAccount,
    signInAsAdmin,
    navigateToRole,
    stalls,
    ownerStall,
    approveStall,
    rejectStall,
    deliveryProfile,
    approveDeliveryPartner,
    rejectDeliveryPartner,
    orders,
  } = useMovana();

  const [adminEmail, setAdminEmail] = useState('admin@movana.app');
  const [adminPass, setAdminPass] = useState('movana-ops-2026');

  // Ensure ownerStall is always visible in admin review if filled or pending
  const allReviewStalls = stalls.some((s) => s.id === ownerStall.id)
    ? stalls
    : ownerStall.name.trim() || ownerStall.verificationStatus !== 'not_started'
      ? [ownerStall, ...stalls]
      : stalls;

  const totalPlatformFees = orders.reduce((sum, o) => sum + o.platformFee, 0);
  const liveStallCount = allReviewStalls.filter((s) => s.isLive).length;
  const pendingStallCount = allReviewStalls.filter(
    (s) => s.verificationStatus === 'pending'
  ).length;

  // Company Admin Sign-In Gate
  if (!userAccount.isAdmin) {
    return (
      <div className="min-h-screen movana-role-backdrop flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FDF9F3] dark:bg-[#221B17] rounded-[24px] shadow-2xl overflow-hidden">
          <ScallopedAwning compact />
          <div className="p-6 sm:p-8">
            <button
              type="button"
              onClick={() => navigateToRole('customer')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E5B52] hover:text-[#E23428] mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Móvana
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#24140E] text-[#FBBF24] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#24140E] dark:text-[#FAF3EB]">
                  Company admin sign in
                </h1>
                <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                  Authorized Móvana onboarding &amp; safety review team
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                signInAsAdmin();
              }}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold mb-1">Admin email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-white dark:bg-[#1B1512] text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Access passcode</label>
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-white dark:bg-[#1B1512] text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl movana-btn-gradient text-white font-extrabold text-sm shadow-md cursor-pointer"
              >
                Sign in to Admin Console
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-[#161210] text-[#24140E] dark:text-[#FAF3EB] pb-24">
      <header className="bg-[#1D120D] text-white border-b border-white/10">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MovanaLogo variant="light" />
            <span className="text-xs font-bold text-[#FBBF24] border-l border-white/20 pl-4">
              Company Admin Console
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => navigateToRole('customer')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => navigateToRole('vendor')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
            >
              Stall owner
            </button>
            <button
              type="button"
              onClick={() => navigateToRole('delivery')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
            >
              Delivery
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1160px] mx-auto px-4 sm:px-6 pt-7 space-y-6">
        {/* Top Platform KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-2xl p-4">
            <div className="text-xs font-bold text-[#6E5B52]">Live Stalls on Map</div>
            <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums">
              {liveStallCount}
            </div>
          </div>
          <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-2xl p-4">
            <div className="text-xs font-bold text-[#6E5B52]">Pending Stall Reviews</div>
            <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-[#D97706]">
              {pendingStallCount}
            </div>
          </div>
          <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-2xl p-4">
            <div className="text-xs font-bold text-[#6E5B52]">Total Orders</div>
            <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums">
              {orders.length}
            </div>
          </div>
          <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-2xl p-4">
            <div className="text-xs font-bold text-[#6E5B52]">5% Platform Fees (Demo)</div>
            <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-[#16A34A]">
              ₹{totalPlatformFees}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Stall Owner Verification Queue */}
          <section className="lg:col-span-7 bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[22px] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-[#E23428]" />
              <div>
                <h2 className="text-lg font-extrabold">Stall Owner Onboarding &amp; FSSAI Review</h2>
                <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                  Verify FSSAI codes and masked Aadhaar records before stalls go live.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {allReviewStalls.map((stall) => (
                <div
                  key={stall.id}
                  className="rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] bg-[#FDFBF8] dark:bg-[#1B1512] p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{stall.pinEmoji}</span>
                        <h3 className="font-extrabold text-[15px]">
                          {stall.name || 'Unnamed Draft Stall'}
                        </h3>
                        {stall.isOwnerStall && (
                          <span className="text-[11px] font-bold text-[#E23428]">(Your Stall)</span>
                        )}
                      </div>
                      <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D] mt-0.5">
                        Owner: {stall.ownerName || 'Not provided'} &middot; {stall.stallType} &middot;{' '}
                        {stall.menu.length} menu items
                      </p>
                    </div>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        stall.verificationStatus === 'approved'
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : stall.verificationStatus === 'pending'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#F5ECE2] text-[#6E5B52]'
                      }`}
                    >
                      {stall.verificationStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-white dark:bg-[#251D19] p-3 rounded-xl border border-[#EFE6DC] dark:border-[#382C26]">
                    <div>FSSAI: {stall.fssaiNumber || 'Pending'}</div>
                    <div>
                      Aadhaar: {stall.aadhaarLast4 ? `XXXX XXXX ${stall.aadhaarLast4}` : 'Not uploaded'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => approveStall(stall.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve stall
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectStall(stall.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DC2626] text-[#DC2626] text-xs font-extrabold hover:bg-[#FEF2F2] cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Delivery Partner Approval + Live Orders Audit */}
          <div className="lg:col-span-5 space-y-5">
            <section className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[22px] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#E23428]" />
                <div>
                  <h2 className="text-lg font-extrabold">Delivery Partner Approval</h2>
                  <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                    Verify RC number &amp; Aadhaar card before rider goes online.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] bg-[#FDFBF8] dark:bg-[#1B1512] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-sm">
                    {deliveryProfile.fullName || 'Current Delivery Partner Account'}
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      deliveryProfile.verificationStatus === 'approved'
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}
                  >
                    {deliveryProfile.verificationStatus.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-[#6E5B52] dark:text-[#B8A79D] font-mono">
                  <div>Phone: {deliveryProfile.phone || 'Not entered'}</div>
                  <div>Vehicle: {deliveryProfile.vehicleType || 'Not selected'}</div>
                  <div>RC No.: {deliveryProfile.rcNumber || 'Not entered'}</div>
                  <div>
                    Aadhaar:{' '}
                    {deliveryProfile.aadhaarLast4
                      ? `XXXX XXXX ${deliveryProfile.aadhaarLast4}`
                      : 'Pending upload'}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={approveDeliveryPartner}
                    className="flex-1 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Approve Vehicle
                  </button>
                  <button
                    type="button"
                    onClick={rejectDeliveryPartner}
                    className="px-3.5 py-2 rounded-xl border border-[#DC2626] text-[#DC2626] text-xs font-extrabold cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </section>

            {/* Live Orders Monitor */}
            <section className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[22px] p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#E23428]" />
                <h2 className="text-base font-extrabold">Live Orders Ledger</h2>
              </div>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-xl border border-[#EFE6DC] dark:border-[#382C26] px-3.5 py-2.5 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold">
                        <span className="font-mono text-[#E23428]">{ord.orderNumber}</span> &middot;{' '}
                        {ord.stallName}
                      </div>
                      <div className="text-[#6E5B52] dark:text-[#B8A79D]">
                        {ord.customerName} &middot; Code:{' '}
                        <span className="font-mono font-bold">{ord.deliveryCode}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-extrabold">₹{ord.total}</div>
                      <div className="uppercase text-[10px] font-bold text-[#6E5B52]">
                        {ord.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
