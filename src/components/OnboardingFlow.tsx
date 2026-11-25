import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useMovana } from '../context/MovanaContext';
import { CustomerBowlArt, ScallopedAwning, ThelaCartIcon } from './BrandAssets';

export function OnboardingFlow() {
  const {
    consentAccepted,
    acceptConsent,
    navigateToRole,
    setLegalModalTopic,
  } = useMovana();
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);

  return (
    <div className="min-h-screen w-full movana-role-backdrop relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Subtle decorative silhouettes matching Screenshot 2 */}
      <div
        className="pointer-events-none select-none absolute left-[10%] bottom-[20%] text-[110px] opacity-[0.07] -rotate-12"
        aria-hidden="true"
      >
        🍞
      </div>
      <div
        className="pointer-events-none select-none absolute right-[12%] top-[18%] text-[96px] opacity-[0.08] rotate-12"
        aria-hidden="true"
      >
        🌶️
      </div>
      <div
        className="pointer-events-none select-none absolute right-[14%] bottom-[16%] text-[90px] opacity-[0.07] -rotate-6"
        aria-hidden="true"
      >
        🥕
      </div>

      {/* Main Role Picker Card (Screenshot 2) */}
      <div
        className={`relative w-full max-w-[490px] bg-[#FDF9F3] dark:bg-[#221B17] rounded-b-[28px] rounded-t-[20px] shadow-2xl overflow-hidden transition-all duration-300 ${
          !consentAccepted ? 'blur-[6px] scale-[0.98] pointer-events-none select-none' : ''
        }`}
      >
        <ScallopedAwning />

        <div className="px-6 sm:px-8 pt-2 pb-8">
          <h1 className="text-[30px] sm:text-[34px] font-extrabold tracking-tight text-[#24140E] dark:text-[#FAF3EB] leading-tight">
            Welcome to Móvana
          </h1>
          <p className="mt-2 text-[15px] text-[#6E5B52] dark:text-[#B8A79D] leading-relaxed">
            Choose how you&apos;ll use it. You can switch roles anytime.
          </p>

          {/* Primary Customer Card */}
          <button
            type="button"
            onClick={() => navigateToRole('customer')}
            className="mt-6 w-full text-left movana-hero-gradient rounded-[22px] p-5 sm:p-6 text-white shadow-lg shadow-[#E23426]/20 hover:brightness-[1.03] active:scale-[0.99] transition-all flex items-center justify-between gap-4 group cursor-pointer"
          >
            <div className="min-w-0">
              <div className="text-[22px] font-extrabold tracking-tight">Customer</div>
              <p className="mt-1.5 text-[14px] text-white/90 leading-snug max-w-[230px]">
                Find stalls near you, order, and track delivery live.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 bg-white text-[#D92D20] font-bold text-sm px-4 py-2 rounded-full shadow-sm group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
                Browse stalls
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
            <CustomerBowlArt />
          </button>

          {/* Divider */}
          <div className="mt-7 mb-4 flex items-center gap-3">
            <span className="text-[13px] font-bold text-[#4A372E] dark:text-[#D9C7BD] whitespace-nowrap">
              Work with Móvana
            </span>
            <div className="flex-1 border-b border-dashed border-[#DFCFC3] dark:border-[#3E312B]" />
          </div>

          {/* Work Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Stall owner */}
            <button
              type="button"
              onClick={() => navigateToRole('vendor')}
              className="text-left bg-white dark:bg-[#2B221D] border border-[#EDE3D8] dark:border-[#3E312B] rounded-[18px] p-4 hover:border-[#E85A2A] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] dark:bg-[#3A2E1B] flex items-center justify-center mb-3.5">
                  <ThelaCartIcon className="w-9 h-9" />
                </div>
                <div className="text-[16px] font-extrabold text-[#24140E] dark:text-[#FAF3EB]">
                  Stall owner
                </div>
                <p className="mt-1 text-[13px] text-[#6E5B52] dark:text-[#B8A79D] leading-snug">
                  Build your menu, go live, manage orders.
                </p>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 bg-[#FFF6DF] dark:bg-[#382C18] text-[#8B5A12] dark:text-[#F6C86E] text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Aadhaar check required
              </div>
            </button>

            {/* Delivery partner */}
            <button
              type="button"
              onClick={() => navigateToRole('delivery')}
              className="text-left bg-white dark:bg-[#2B221D] border border-[#EDE3D8] dark:border-[#3E312B] rounded-[18px] p-4 hover:border-[#E85A2A] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FDECD8] dark:bg-[#3A271B] flex items-center justify-center mb-3.5 text-2xl">
                  🛵
                </div>
                <div className="text-[16px] font-extrabold text-[#24140E] dark:text-[#FAF3EB]">
                  Delivery partner
                </div>
                <p className="mt-1 text-[13px] text-[#6E5B52] dark:text-[#B8A79D] leading-snug">
                  Accept requests and complete deliveries.
                </p>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 bg-[#FFF6DF] dark:bg-[#382C18] text-[#8B5A12] dark:text-[#F6C86E] text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Aadhaar check required
              </div>
            </button>
          </div>

          {/* Company admin sign in */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigateToRole('admin')}
              className="text-[13px] font-semibold text-[#6E5B52] dark:text-[#B8A79D] underline underline-offset-4 hover:text-[#E23428] transition-colors cursor-pointer"
            >
              Company admin sign in
            </button>
          </div>
        </div>
      </div>

      {/* Screenshot 1: Privacy & Consent Modal Overlay */}
      {!consentAccepted && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="movana-consent-title"
        >
          <div className="w-full max-w-[490px] bg-white dark:bg-[#221B17] rounded-[22px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <ScallopedAwning compact />

            <div className="px-6 sm:px-7 pt-2 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="movana-consent-title"
                    className="text-[26px] font-extrabold tracking-tight text-[#24140E] dark:text-[#FAF3EB]"
                  >
                    Welcome to Móvana
                  </h2>
                  <p className="mt-0.5 text-[14px] font-bold text-[#4A372E] dark:text-[#D9C7BD]">
                    Before you continue
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#FDF4E5] dark:bg-[#332720] px-2.5 py-1.5 rounded-xl border border-[#F0E1CC] dark:border-[#47382F] text-base shrink-0">
                  <span>🍞</span>
                  <span>🌶️</span>
                  <span>🥕</span>
                </div>
              </div>

              <p className="mt-3.5 text-[14px] text-[#5B4940] dark:text-[#C5B5AC]">
                Móvana collects the following to run your orders:
              </p>

              <ul className="mt-3 space-y-2.5 text-[13.5px] text-[#3B2B24] dark:text-[#E5D7CE] leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-base leading-none">📍</span>
                  <span>
                    <strong className="font-bold">Location</strong> — to show stalls near you
                    (optional; you can set it manually)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-base leading-none">📱</span>
                  <span>
                    <strong className="font-bold">Phone number &amp; delivery address</strong> —
                    required to complete orders
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-base leading-none">📧</span>
                  <span>
                    <strong className="font-bold">Gmail / Google account</strong> — used only to
                    verify your identity; we do not share or sell your data
                  </span>
                </li>
              </ul>

              <div className="mt-4 rounded-xl bg-[#FDF5EA] dark:bg-[#2E241E] border border-[#F2E5D5] dark:border-[#43352D] px-4 py-3 text-[12.5px] text-[#6A574E] dark:text-[#BFAEA4] leading-relaxed">
                By continuing you agree to Móvana&apos;s{' '}
                <button
                  type="button"
                  onClick={() => setLegalModalTopic('terms')}
                  className="text-[#D93025] font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and confirm you have read our{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacySheet(true)}
                  className="text-[#D93025] font-semibold underline underline-offset-2 cursor-pointer"
                >
                  Privacy Notice
                </button>
                . You can change your data choices anytime from the footer.
              </div>

              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => acceptConsent(true)}
                  className="flex-1 bg-[#E23428] hover:bg-[#CA291E] text-white font-bold text-[14.5px] py-3 px-5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Accept &amp; Continue
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrivacySheet(true)}
                  className="sm:w-auto px-4 py-3 rounded-xl border border-[#DFD5CC] dark:border-[#453830] text-[13.5px] font-semibold text-[#3B2B24] dark:text-[#E8DAD0] hover:bg-[#FAF4EC] dark:hover:bg-[#2D241E] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Read Privacy Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice Drawer / Modal */}
      {showPrivacySheet && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#221B17] rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE6DC] dark:border-[#3A2E27]">
              <h3 className="text-lg font-extrabold text-[#24140E] dark:text-[#FAF3EB]">
                Móvana Privacy Notice
              </h3>
              <button
                type="button"
                onClick={() => setShowPrivacySheet(false)}
                className="p-2 rounded-lg hover:bg-[#F5ECE2] dark:hover:bg-[#332720] cursor-pointer"
                aria-label="Close privacy notice"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-[#4D3B32] dark:text-[#CFC0B7] leading-relaxed">
              <p>
                <strong>1. Hyperlocal Location Data:</strong> Your GPS coordinates are used solely
                to show live street stalls and vegetable thelas within 5 km and calculate accurate
                pickup/delivery distance. You can manually pick any locality at any time.
              </p>
              <p>
                <strong>2. Order &amp; Handover Verification:</strong> Phone numbers and delivery
                addresses are shared only with the stall preparing your food and the assigned
                delivery partner until handover is confirmed via your 4-digit code.
              </p>
              <p>
                <strong>3. Stall Owner &amp; Delivery Partner Onboarding:</strong> Uploaded Aadhaar
                card images are used exclusively for manual onboarding safety review. Only the last
                4 digits are saved in the verification record.
              </p>
              <p>
                <strong>4. Control &amp; Deletion:</strong> You can export or delete all stored
                data at any time via <em>Request data deletion</em> in the site footer.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPrivacySheet(false)}
                className="px-4 py-2 rounded-xl border border-[#DFD5CC] dark:border-[#453830] text-sm font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPrivacySheet(false);
                  acceptConsent(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#E23428] text-white text-sm font-bold cursor-pointer"
              >
                Accept &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
