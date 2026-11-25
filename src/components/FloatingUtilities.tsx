import React, { useEffect, useState } from 'react';
import {
  ArrowUp,
  Globe,
  Mic,
  Moon,
  Send,
  Sparkles,
  Sun,
  Volume2,
  X,
} from 'lucide-react';
import { useMovana } from '../context/MovanaContext';
import { UI_TRANSLATIONS } from '../data/seedData';
import { LanguageCode } from '../types/movana';

const HELPER_QA = [
  {
    keywords: ['fssai', 'licence', 'license', 'foscos'],
    q: 'How do I get my 14-digit FSSAI code?',
    a: 'Open foscos.fssai.gov.in, choose New License / Registration under Street Food / Petty Food Business (starts at ₹100/year), and enter the 14-digit number in Step 1 of the Stall Owner app.',
  },
  {
    keywords: ['code', '4-digit', 'otp', 'handover', 'delivery'],
    q: 'How does the 4-digit handover code work?',
    a: 'When you prepay an order, Móvana generates a unique 4-digit code. Only share it with the delivery partner (or stall owner for dineout) once your order is physically in your hand.',
  },
  {
    keywords: ['upi', 'qr', 'pay', 'fee', 'commission'],
    q: 'How do stall payments and the 5% fee work?',
    a: 'Stall owners receive 100% of their menu prices via their UPI ID or uploaded QR code. Customers pay a transparent flat 5% platform fee at checkout.',
  },
  {
    keywords: ['approve', 'verify', 'aadhaar', 'admin', 'live'],
    q: 'How do I get my stall or vehicle approved?',
    a: 'Submit your details in Step 3 (Stall Owner) or Partner Profile (Delivery Partner). In this interactive build, you can also open the Company Admin console from the top bar to approve your application right away!',
  },
];

export function FloatingUtilities() {
  const {
    activeRole,
    showRolePicker,
    darkMode,
    toggleDarkMode,
    language,
    setLanguage,
    authModalOpen,
    setAuthModalOpen,
    userAccount,
    signInUser,
    signOutUser,
    orders,
    setActiveTrackerOrderId,
    legalModalTopic,
    setLegalModalTopic,
    resetAllData,
    helperOpen,
    setHelperOpen,
    navigateToRole,
    toast,
    showToast,
  } = useMovana();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Auth form state
  const [authName, setAuthName] = useState(userAccount.name || '');
  const [authEmail, setAuthEmail] = useState(userAccount.email || '');
  const [authPhone, setAuthPhone] = useState(userAccount.phone || '');
  const [authAddress, setAuthAddress] = useState(
    userAccount.address || 'House 18, Street 2, Agar Nagar, Ludhiana'
  );

  // Helper drawer chat state
  const [helperQuery, setHelperQuery] = useState('');
  const [helperHistory, setHelperHistory] = useState<
    { role: 'user' | 'helper'; text: string }[]
  >([
    {
      role: 'helper',
      text:
        activeRole === 'vendor'
          ? 'Hi! Need help setting up your FSSAI licence, UPI QR, menu, or going live? Tap a topic below or ask a question.'
          : 'Welcome to Móvana! Ask about spotting live thelas, the 4-digit handover code, UPI prepayment, or opening your own stall.',
    },
  ]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 360);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSpeakPage = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported in this browser.', 'info');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      activeRole === 'vendor'
        ? 'Móvana Stall Owner App. Complete Food Licence, Stall and Menu, Aadhaar Verification, and Go Live to start receiving orders.'
        : activeRole === 'delivery'
          ? 'Móvana Delivery Partner Workspace. Register your vehicle, get admin approval, go online, and verify deliveries with the customer four digit code.'
          : 'Welcome to Móvana. Spot live street food stalls and fresh vegetable carts near you, pre-order with UPI, and track delivery live.'
    );
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
    showToast('Reading page summary aloud...', 'info');
  };

  const handleVoiceCommand = () => {
    setHelperOpen(true);
    showToast('Quick helper opened—tap any question or type below.', 'info');
  };

  const submitHelperQuestion = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const match = HELPER_QA.find((item) =>
      item.keywords.some((kw) => lower.includes(kw))
    );
    const reply = match
      ? match.a
      : 'You can browse live stalls on the Customer map, register your thela in the Stall Owner app, accept trips in the Delivery Partner workspace, and test approvals anytime in the Company Admin console.';
    setHelperHistory((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'helper', text: reply },
    ]);
    setHelperQuery('');
  };

  const legalContent = (() => {
    switch (legalModalTopic) {
      case 'terms':
        return {
          title: 'Terms of Service',
          body: 'Móvana connects customers with independent street-food stalls, vegetable carts, and hyperlocal delivery partners. Customers pay item prices plus a flat 5% platform fee. All stall owners must hold valid FSSAI credentials and pass manual identity verification.',
        };
      case 'privacy':
      case 'privacy-choices':
        return {
          title: 'Privacy & Data Choices',
          body: 'Móvana stores your preferences, demo orders, and stall setup locally in your browser so all four roles stay synced seamlessly. Your GPS location is optional and can be switched to any Ludhiana locality manually.',
        };
      case 'refunds':
        return {
          title: 'Refunds & Cancellation Policy',
          body: 'Orders cancelled before the stall marks them as Preparing receive an instant full refund in this demo build. If an order is damaged or missing items after handover, contact Grievance & support with your Order ID.',
        };
      case 'grievance':
      case 'report':
        return {
          title: 'Grievance & Support',
          body: 'Need assistance with an order, stall verification, or delivery trip? Email support@movana.app or call our Ludhiana partner desk (Mon–Sun, 7 AM – 11 PM). Every report receives a ticket within 15 minutes.',
        };
      case 'alerts':
        return {
          title: 'Order Alerts',
          body: 'Live order updates—including Stall Acceptance, Preparing, Ready for Pickup, Rider Assignment, and your 4-digit handover code—sync automatically across the Customer Tracker, Stall Owner App, and Delivery Workspace.',
        };
      case 'delete-data':
        return {
          title: 'Request Data Deletion',
          body: 'You can immediately erase all locally saved Móvana demo data, stalls, orders, and preferences from this browser by clicking the button below.',
        };
      default:
        return null;
    }
  })();

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-full shadow-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            toast.tone === 'error'
              ? 'bg-[#B91C1C] text-white'
              : toast.tone === 'success'
                ? 'bg-[#166534] text-white'
                : 'bg-[#24140E] text-white'
          }`}
        >
          <span>{toast.text}</span>
        </div>
      )}

      {/* Floating Bottom-Left Utility Pill (Matches Screenshots 3–13) */}
      {!showRolePicker && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="relative flex items-center gap-1.5 bg-white/95 dark:bg-[#251D19]/95 backdrop-blur-md border border-[#E5D9CC] dark:border-[#3E322B] rounded-full px-2.5 py-1.5 shadow-lg">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLangMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-[#24140E] dark:text-[#FAF3EB] hover:bg-[#F5ECE2] dark:hover:bg-[#352A24] cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#5B4940] dark:text-[#CFC0B7]" />
              <span>{UI_TRANSLATIONS[language].label}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#251D19] border border-[#E5D9CC] dark:border-[#3E322B] rounded-2xl shadow-xl p-1.5 min-w-[130px]">
                {(['en', 'hi', 'pa'] as LanguageCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLanguage(code);
                      setLangMenuOpen(false);
                      showToast(`Language switched to ${UI_TRANSLATIONS[code].label}`, 'info');
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      language === code
                        ? 'bg-[#FFF1EB] dark:bg-[#3B231B] text-[#E23428]'
                        : 'hover:bg-[#FAF2E8] dark:hover:bg-[#332720]'
                    }`}
                  >
                    {UI_TRANSLATIONS[code].label}
                  </button>
                ))}
              </div>
            )}

            {/* Dark / Warm Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
              className="w-8 h-8 rounded-full bg-[#FEF3C7] dark:bg-[#3A2D18] text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center hover:brightness-95 cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Voice Quick Action */}
            <button
              type="button"
              onClick={handleVoiceCommand}
              title="Voice / Quick helper"
              aria-label="Open quick helper"
              className="w-8 h-8 rounded-full bg-[#FEF3C7] dark:bg-[#3A2D18] text-[#C2410C] dark:text-[#FDBA74] flex items-center justify-center hover:brightness-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Read Aloud Speaker */}
            <button
              type="button"
              onClick={handleSpeakPage}
              title="Read page aloud"
              aria-label="Read page summary aloud"
              className="w-8 h-8 rounded-full bg-[#FEF3C7] dark:bg-[#3A2D18] text-[#C2410C] dark:text-[#FDBA74] flex items-center justify-center hover:brightness-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Helper Pill + Scroll-to-Top (Screenshots 5, 6, 12, 13) */}
      {!showRolePicker && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHelperOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1713] text-white text-xs font-extrabold shadow-xl hover:bg-[#2F251F] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
            {activeRole === 'vendor' ? 'Stall helper' : 'Ask Móvana'}
          </button>

          {showScrollTop && (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
              className="w-10 h-10 rounded-full bg-[#E23428] text-white shadow-xl flex items-center justify-center hover:bg-[#C9261E] transition-colors cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* HELPER DRAWER (Ask Móvana / Stall helper) */}
      {helperOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-end sm:items-center justify-end p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white dark:bg-[#221B17] rounded-[24px] shadow-2xl border border-[#EAE0D5] dark:border-[#382C26] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-5 py-4 bg-[#1C1713] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                <span className="font-extrabold text-sm">
                  {activeRole === 'vendor' ? 'Stall helper' : 'Ask Móvana'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHelperOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {helperHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#E23428] text-white ml-8'
                      : 'bg-[#F6EFE6] dark:bg-[#2E241E] text-[#24140E] dark:text-[#FAF3EB] mr-4'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] font-bold text-[#8C7A70]">Quick topics</div>
                {HELPER_QA.map((item) => (
                  <button
                    key={item.q}
                    type="button"
                    onClick={() => submitHelperQuestion(item.q)}
                    className="block w-full text-left px-3 py-2 rounded-xl border border-[#EAE0D5] dark:border-[#3E322B] hover:border-[#E23428] font-semibold transition-colors cursor-pointer"
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitHelperQuestion(helperQuery);
              }}
              className="p-3 border-t border-[#EFE6DC] dark:border-[#382C26] flex items-center gap-2"
            >
              <input
                type="text"
                value={helperQuery}
                onChange={(e) => setHelperQuery(e.target.value)}
                placeholder="Ask about stalls, FSSAI, UPI, orders..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#FDF8F0] dark:bg-[#1B1512] border border-[#E4D9CE] dark:border-[#3E322B] text-xs"
              />
              <button
                type="submit"
                aria-label="Send question"
                className="w-9 h-9 rounded-xl bg-[#E23428] text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT / SIGN-IN / MY ORDERS MODAL */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#221B17] rounded-[24px] shadow-2xl p-6 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE6DC] dark:border-[#382C26]">
              <h3 className="text-lg font-extrabold">
                {userAccount.signedIn ? 'Your Móvana Account' : 'Sign in to Móvana'}
              </h3>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F5ECE2] dark:hover:bg-[#332720] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userAccount.signedIn ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-[#FDF6EB] dark:bg-[#2C221C] p-4">
                  <div className="font-extrabold text-base">{userAccount.name}</div>
                  <div className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                    {userAccount.email}
                  </div>
                  {userAccount.phone && (
                    <div className="text-xs font-mono mt-1">{userAccount.phone}</div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#6E5B52] mb-2">
                    Recent Orders ({orders.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {orders.map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => {
                          setAuthModalOpen(false);
                          navigateToRole('customer');
                          setActiveTrackerOrderId(ord.id);
                        }}
                        className="w-full text-left rounded-xl border border-[#EAE0D5] dark:border-[#382C26] p-3 hover:border-[#E23428] flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-extrabold">
                            {ord.orderNumber} &middot; {ord.stallName}
                          </div>
                          <div className="text-[#6E5B52]">
                            Code: <strong className="font-mono">{ord.deliveryCode}</strong> &middot;{' '}
                            {ord.status.replace('_', ' ')}
                          </div>
                        </div>
                        <span className="font-mono font-bold">₹{ord.total}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={signOutUser}
                    className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                  >
                    Sign out
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#24140E] text-white text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  signInUser(authName, authEmail, authPhone, authAddress);
                }}
                className="mt-4 space-y-3"
              >
                <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                  Verify your Gmail / Google account and contact details to sync orders across
                  sessions.
                </p>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Gmail address (e.g. name@gmail.com)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                />
                <input
                  type="tel"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  placeholder="10-digit phone number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm font-mono"
                />
                <input
                  type="text"
                  value={authAddress}
                  onChange={(e) => setAuthAddress(e.target.value)}
                  placeholder="Delivery address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl movana-btn-gradient text-white text-sm font-extrabold shadow-sm cursor-pointer"
                >
                  Continue with Account
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FOOTER LEGAL & DATA DELETION MODAL */}
      {legalContent && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#221B17] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE6DC] dark:border-[#382C26]">
              <h3 className="text-base font-extrabold">{legalContent.title}</h3>
              <button
                type="button"
                onClick={() => setLegalModalTopic(null)}
                className="p-1.5 rounded-lg hover:bg-[#F5ECE2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-[#5B4940] dark:text-[#CFC0B7] leading-relaxed">
              {legalContent.body}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              {legalModalTopic === 'delete-data' && (
                <button
                  type="button"
                  onClick={resetAllData}
                  className="px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-extrabold cursor-pointer"
                >
                  Erase All Demo Data &amp; Restart
                </button>
              )}
              <button
                type="button"
                onClick={() => setLegalModalTopic(null)}
                className="px-4 py-2 rounded-xl bg-[#24140E] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
