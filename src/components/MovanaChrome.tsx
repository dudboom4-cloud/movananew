import React from 'react';
import { ArrowUpRight, ShoppingCart, User } from 'lucide-react';
import { useMovana } from '../context/MovanaContext';
import { UI_TRANSLATIONS } from '../data/seedData';
import { MovanaLogo } from './BrandAssets';

export function MovanaTopNav({
  showRoleStrip = true,
  onOpenInstallModal,
}: {
  showRoleStrip?: boolean;
  onOpenInstallModal?: () => void;
}) {
  const {
    activeRole,
    navigateToRole,
    setShowRolePicker,
    cart,
    setCartDrawerOpen,
    userAccount,
    setAuthModalOpen,
    language,
    orders,
    setActiveTrackerOrderId,
  } = useMovana();

  const t = UI_TRANSLATIONS[language];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  return (
    <div className="sticky top-0 z-40">
      <header className="movana-nav-gradient text-white shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand zone */}
          <button
            type="button"
            onClick={() => setShowRolePicker(true)}
            className="cursor-pointer focus-visible:outline-2 focus-visible:outline-white rounded-lg"
            title="Switch role or return to Móvana home"
          >
            <MovanaLogo variant="light" />
          </button>

          {/* Nav links + primary actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden md:flex items-center gap-5 text-[13.5px] font-semibold text-white/95">
              <button
                type="button"
                onClick={() => navigateToRole('customer', 'how')}
                className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Móvana Corporate
              </button>
              <button
                type="button"
                onClick={() => navigateToRole('vendor')}
                className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Partner with us
              </button>
            </nav>

            <button
              type="button"
              onClick={onOpenInstallModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/60 text-[13px] font-bold text-white hover:bg-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Get the App
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Profile / Orders button */}
            <button
              type="button"
              onClick={() => {
                if (activeOrdersCount > 0 && !userAccount.signedIn) {
                  setAuthModalOpen(true);
                } else if (userAccount.signedIn && orders.length > 0) {
                  setActiveTrackerOrderId(orders[0].id);
                } else {
                  setAuthModalOpen(true);
                }
              }}
              aria-label="Account and orders"
              className="relative w-10 h-10 rounded-full bg-[#1C1410] border-2 border-white/30 flex items-center justify-center text-white hover:scale-105 transition-transform shrink-0 cursor-pointer"
              title={userAccount.signedIn ? `${userAccount.name} · Orders` : 'Sign in / My Orders'}
            >
              <User className="w-4 h-4" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FACC15] text-[#24140E] text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            {/* Cart button */}
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Open cart"
              className="inline-flex items-center gap-2 bg-white text-[#24140E] px-3.5 py-1.5 rounded-full shadow-sm hover:bg-[#FFF5EC] transition-colors shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-[#5B4940]" />
              <span className="w-6 h-6 rounded-full bg-[#F5A623] text-white text-xs font-extrabold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Role switcher strip matching Screenshots 3 & 6 */}
      {showRoleStrip && (
        <div className="bg-[#FDF8F0]/95 dark:bg-[#1B1512]/95 backdrop-blur-sm border-b border-[#EDE3D8] dark:border-[#322721]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2">
            <div className="flex items-center justify-between gap-4 bg-[#F6EFE6] dark:bg-[#251D19] border border-[#E9DED2] dark:border-[#382C26] rounded-xl p-1">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => navigateToRole('customer')}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeRole === 'customer'
                      ? 'bg-[#E23428] text-white shadow-sm'
                      : 'text-[#4A372E] dark:text-[#CFC0B7] hover:text-[#24140E] dark:hover:text-white'
                  }`}
                >
                  {t.customerTab}
                </button>
                <button
                  type="button"
                  onClick={() => navigateToRole('vendor')}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeRole === 'vendor'
                      ? 'bg-[#E23428] text-white shadow-sm'
                      : 'text-[#4A372E] dark:text-[#CFC0B7] hover:text-[#24140E] dark:hover:text-white'
                  }`}
                >
                  {t.ownerTab}
                </button>
                <button
                  type="button"
                  onClick={() => navigateToRole('delivery')}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeRole === 'delivery'
                      ? 'bg-[#E23428] text-white shadow-sm'
                      : 'text-[#4A372E] dark:text-[#CFC0B7] hover:text-[#24140E] dark:hover:text-white'
                  }`}
                >
                  {t.deliveryTab}
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigateToRole('admin')}
                className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-[#24140E] text-white'
                    : 'text-[#6E5B52] dark:text-[#B8A79D] hover:text-[#E23428]'
                }`}
              >
                Admin review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MovanaFooter() {
  const { navigateToRole, setLegalModalTopic } = useMovana();

  return (
    <footer className="bg-[#1D0F08] text-[#D7C3B5] border-t-2 border-[#E23428]/50 mt-16 pb-20 sm:pb-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-7 text-center">
        <p className="text-[12px] text-[#B9A497]">
          &copy; 2026 Móvana &middot; Demo build: payments are simulated. &middot; Build v2.1
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[12px] text-[#F5C57A]">
          <button
            type="button"
            onClick={() => navigateToRole('customer', 'help-centre')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Help &amp; FAQ
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => navigateToRole('vendor')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Run a stall? Open the stall owner app
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => navigateToRole('delivery')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Delivery partner workspace
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => setLegalModalTopic('privacy')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Privacy
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => setLegalModalTopic('terms')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Terms
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => setLegalModalTopic('refunds')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Refunds &amp; cancellation
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => setLegalModalTopic('grievance')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Grievance &amp; support
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => setLegalModalTopic('report')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Help &amp; report a problem
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => setLegalModalTopic('alerts')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Order alerts
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => setLegalModalTopic('privacy-choices')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Privacy choices
          </button>
          <span className="text-[#6E5446]">&middot;</span>
          <button
            type="button"
            onClick={() => setLegalModalTopic('delete-data')}
            className="underline underline-offset-2 hover:text-white cursor-pointer"
          >
            Request data deletion
          </button>
        </div>
      </div>
    </footer>
  );
}
