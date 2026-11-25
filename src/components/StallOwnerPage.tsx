import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Lock,
  MapPin,
  Play,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useMovana } from '../context/MovanaContext';
import { FoodDietaryType, StallCategory } from '../types/movana';
import { ThelaCartIcon } from './BrandAssets';
import { MovanaFooter, MovanaTopNav } from './MovanaChrome';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function StallOwnerPage() {
  const {
    ownerStall,
    updateOwnerStall,
    addOwnerMenuItem,
    removeOwnerMenuItem,
    saveOwnerStallToPlatform,
    submitOwnerForVerification,
    toggleOwnerGoLive,
    navigateToRole,
    orders,
    updateOrderStatus,
    showToast,
  } = useMovana();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [fssaiInput, setFssaiInput] = useState(ownerStall.fssaiNumber || '');
  const [fssaiVerified, setFssaiVerified] = useState(
    Boolean(ownerStall.fssaiNumber && /^\d{14}$/.test(ownerStall.fssaiNumber))
  );
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackRefNo, setTrackRefNo] = useState('');

  // Menu item builder state
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishDesc, setDishDesc] = useState('');
  const [dishPhoto, setDishPhoto] = useState<string | undefined>(undefined);

  // Aadhaar form state (never persists full 12 digits in store)
  const [aadhaarRaw, setAadhaarRaw] = useState('');
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [aadhaarSubmitted, setAadhaarSubmitted] = useState(
    Boolean(ownerStall.aadhaarLast4)
  );

  // Incoming orders relevant to owner's stall (or demo orders if owner wants to test)
  const ownerOrders = orders.filter(
    (o) =>
      o.stallId === ownerStall.id ||
      (ownerStall.verificationStatus === 'approved' && o.status !== 'cancelled')
  );

  const jumpToStep = (step: 1 | 2 | 3 | 4) => {
    setActiveStep(step);
    const el = document.getElementById(`vendor-step-${step}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCheckFssai = () => {
    const digits = fssaiInput.replace(/\D/g, '');
    if (digits.length !== 14) {
      showToast('FSSAI licence / registration number must be exactly 14 digits.', 'error');
      return;
    }
    setFssaiInput(digits);
    setFssaiVerified(true);
    updateOwnerStall({ fssaiNumber: digits });
    showToast('14-digit FSSAI code format verified & saved to your stall profile!', 'success');
  };

  const handleUpiQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const derivedSlug = (ownerStall.name || 'mystall')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 14);
    const detectedUpi = ownerStall.upiId || `${derivedSlug || 'movanastall'}@okaxis`;
    updateOwnerStall({ upiQrImage: dataUrl, upiId: detectedUpi });
    showToast(`QR uploaded! Read UPI ID: ${detectedUpi}`, 'success');
  };

  const handleStallPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    if (files.length === 0) return;
    const urls = await Promise.all(files.map(readFileAsDataUrl));
    updateOwnerStall({ photos: [...ownerStall.photos, ...urls].slice(0, 3) });
    showToast(`Added ${urls.length} stall photo(s)`, 'success');
  };

  const handleDishPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setDishPhoto(url);
  };

  const handleAddMenuItem = () => {
    const parsedPrice = Number(dishPrice);
    if (!dishName.trim() || !parsedPrice || parsedPrice <= 0) {
      showToast('Enter a valid item name and price (₹).', 'error');
      return;
    }
    addOwnerMenuItem({
      name: dishName.trim(),
      price: parsedPrice,
      category: dishCategory.trim() || 'Specials',
      isVeg: dishIsVeg,
      description: dishDesc.trim(),
      photo: dishPhoto,
    });
    setDishName('');
    setDishPrice('');
    setDishCategory('');
    setDishDesc('');
    setDishPhoto(undefined);
  };

  const formatAadhaarInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAadhaarPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    updateOwnerStall({ aadhaarPhoto: url });
    showToast('Aadhaar card photo attached for manual review.', 'info');
  };

  const handleSubmitAadhaar = () => {
    const digits = aadhaarRaw.replace(/\D/g, '');
    if (digits.length !== 12) {
      showToast('Please enter a valid 12-digit Aadhaar number.', 'error');
      return;
    }
    if (!aadhaarConsent) {
      showToast('Please check the consent box before submitting.', 'error');
      return;
    }
    const last4 = digits.slice(-4);
    updateOwnerStall({ aadhaarLast4: last4 });
    setAadhaarSubmitted(true);
    setAadhaarRaw(''); // Clear full number immediately for privacy
    showToast(`Aadhaar ending in ${last4} queued for authorized admin review.`, 'success');
  };

  const stallStatusBadge = (() => {
    if (ownerStall.isLive) return { text: 'Live on customer map', dot: 'bg-[#16A34A]' };
    if (ownerStall.verificationStatus === 'approved')
      return { text: 'Verified · Ready to go live', dot: 'bg-[#16A34A]' };
    if (ownerStall.verificationStatus === 'pending')
      return { text: 'Pending company admin review', dot: 'bg-[#F59E0B]' };
    if (ownerStall.name.trim()) return { text: 'Draft saved · Not verified yet', dot: 'bg-[#94A3B8]' };
    return { text: 'Not set up yet', dot: 'bg-[#94A3B8]' };
  })();

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-[#161210] text-[#24140E] dark:text-[#FAF3EB] flex flex-col">
      <MovanaTopNav showRoleStrip />

      <main className="max-w-[1060px] w-full mx-auto px-4 sm:px-6 pt-6 flex-1">
        {/* Red Stall Owner Hero Banner (Screenshot 6) */}
        <section className="rounded-[20px] bg-[#B82019] text-white px-6 py-5 sm:px-7 sm:py-6 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight flex items-center gap-2.5">
              <span>🧑‍🍳</span> Stall owner app
            </h1>
            <p className="mt-1 text-[13.5px] text-white/85">
              Set up your stall, get verified, then start receiving orders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateToRole('customer')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Customer site
          </button>
        </section>

        {/* Your Stall Status Card (Screenshot 6) */}
        <section className="mt-4 bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[18px] px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FFF6D6] dark:bg-[#3A2E1B] flex items-center justify-center shrink-0">
              <ThelaCartIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-[16px] font-extrabold">
                {ownerStall.name.trim() || 'Your stall'}
              </h2>
              <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D] flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${stallStatusBadge.dot}`} />
                {stallStatusBadge.text}
              </p>
            </div>
          </div>

          {ownerStall.verificationStatus === 'pending' && (
            <button
              type="button"
              onClick={() => navigateToRole('admin')}
              className="px-4 py-2 rounded-xl bg-[#24140E] text-[#FBBF24] text-xs font-extrabold hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
            >
              Open Company Admin to Approve &rarr;
            </button>
          )}
          {ownerStall.verificationStatus === 'approved' && (
            <button
              type="button"
              onClick={toggleOwnerGoLive}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                ownerStall.isLive
                  ? 'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]'
                  : 'bg-[#E23428] text-white'
              }`}
            >
              {ownerStall.isLive ? '● Broadcasting Live (Tap to pause)' : 'Go Live Now'}
            </button>
          )}
        </section>

        {/* 4-Step Progress Cards (Screenshot 6) */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            [
              { step: 1, title: 'Food licence', sub: 'FSSAI number', done: fssaiVerified },
              {
                step: 2,
                title: 'Stall & menu',
                sub: 'What customers see',
                done: Boolean(ownerStall.name.trim() && ownerStall.menu.length > 0),
              },
              {
                step: 3,
                title: 'Verification',
                sub: 'Company review',
                done: ownerStall.verificationStatus === 'approved',
              },
              { step: 4, title: 'Go live', sub: 'Start selling', done: ownerStall.isLive },
            ] as const
          ).map((item) => {
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => jumpToStep(item.step)}
                className={`text-left bg-white dark:bg-[#221B17] rounded-2xl p-3.5 border transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'border-[#F27524] ring-2 ring-[#F27524]/15 shadow-xs'
                    : 'border-[#EAE0D5] dark:border-[#382C26] hover:border-[#D9C7B8]'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    item.done
                      ? 'bg-[#16A34A] text-white'
                      : isActive
                        ? 'bg-[#C9261E] text-white'
                        : 'bg-[#EFE6DC] dark:bg-[#332720] text-[#6E5B52] dark:text-[#B8A79D]'
                  }`}
                >
                  {item.done ? '✓' : item.step}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-extrabold truncate">{item.title}</div>
                  <div className="text-[11px] text-[#7D6A60] dark:text-[#A9988E] truncate">
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Workspace */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: 4 Setup Steps */}
          <div className="lg:col-span-7 space-y-5">
            {/* STEP 1: FOOD LICENCE (Screenshots 6 & 7) */}
            <section
              id="vendor-step-1"
              className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-5 sm:p-6 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#C9261E] text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h2 className="text-[17px] font-extrabold">Food licence</h2>
                  <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                    Required by law before a stall can be listed.
                  </p>
                </div>
              </div>

              {/* Yellow FoSCoS Info Box */}
              <div className="mt-4 rounded-2xl bg-[#FFF6D6] dark:bg-[#2F2616] border border-[#F2D57E] dark:border-[#5C4920] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[11.5px] font-bold text-[#7C5A18] dark:text-[#E9C46A]">
                      Before you register
                    </p>
                    <h3 className="text-[16px] font-extrabold text-[#24140E] dark:text-[#FAF3EB] mt-0.5">
                      Get your food licence first
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full border ${
                      fssaiVerified
                        ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                        : 'bg-[#FFFDF5] dark:bg-[#3B301B] text-[#6E5B52] dark:text-[#E5D7CE] border-[#E7D59C] dark:border-[#635026]'
                    }`}
                  >
                    {fssaiVerified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified format
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" /> Not verified
                      </>
                    )}
                  </span>
                </div>

                <p className="mt-2 text-[12.5px] text-[#5B4725] dark:text-[#DECFA9] leading-relaxed">
                  A valid FSSAI food licence or registration is required before a stall can be
                  listed on Móvana.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* Left: 3 simple steps */}
                  <div>
                    <p className="text-[12.5px] font-extrabold text-[#24140E] dark:text-[#FAF3EB]">
                      Apply in 3 simple steps
                    </p>
                    <ol className="mt-2 space-y-1.5 text-[12px] text-[#4D3B1D] dark:text-[#DED0B0] list-decimal list-inside leading-relaxed">
                      <li>Open the official FoSCoS portal and choose New License / Registration.</li>
                      <li>Complete the form, upload documents, and pay the official fee.</li>
                      <li>
                        Return here and enter the 14-digit FSSAI licence / registration number.
                      </li>
                    </ol>

                    <div className="mt-3.5 flex flex-wrap gap-2">
                      <a
                        href="https://foscos.fssai.gov.in/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl movana-btn-gradient text-white text-[12px] font-extrabold shadow-xs"
                      >
                        Open official FoSCoS portal
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowTrackModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#3B301B] border border-[#E5D4A0] dark:border-[#635026] text-[12px] font-bold text-[#24140E] dark:text-[#FAF3EB] hover:bg-[#FFFBF0] cursor-pointer"
                      >
                        Track application
                      </button>
                    </div>
                  </div>

                  {/* Right: Hindi Walkthrough Video Card (Screenshot 6) */}
                  <div>
                    <p className="text-[11.5px] font-semibold text-[#7C5A18] dark:text-[#E9C46A] mb-1.5">
                      Hindi walkthrough
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="group relative w-full aspect-video rounded-xl overflow-hidden bg-[#1F2937] text-white shadow-md cursor-pointer block"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E] via-[#1E3A5F] to-[#111827] p-3 flex flex-col justify-between text-left">
                        <div className="text-[11px] font-extrabold leading-tight bg-black/35 px-2 py-1 rounded-md w-fit">
                          FSSAI License Registration — Hindi Guide
                        </div>
                        <div className="self-center w-12 h-9 rounded-xl bg-[#DC2626] group-hover:scale-105 transition-transform flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                        </div>
                        <div className="text-[10px] text-white/80 flex items-center justify-between">
                          <span>Step-by-step FoSCoS tutorial</span>
                          <span className="font-bold">Watch guide</span>
                        </div>
                      </div>
                    </button>
                    <p className="mt-1.5 text-[11px] text-[#6B542B] dark:text-[#CDBB92]">
                      Video guide in Hindi. Open the portal in another tab while following along.
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-[#7A6136] dark:text-[#C5B48B]">
                  Use only the official FSSAI portal. Móvana never asks for your Aadhaar, PAN, or
                  portal password here.
                </p>

                {/* 14-digit FSSAI input (Screenshot 7) */}
                <div className="mt-4 pt-4 border-t border-[#EED386] dark:border-[#57451E]">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="fssai-input"
                      className="text-[12.5px] font-extrabold text-[#24140E] dark:text-[#FAF3EB]"
                    >
                      Enter your FSSAI licence / registration number
                    </label>
                    <button
                      type="button"
                      onClick={() => setFssaiInput('22126045001234')}
                      className="text-[11px] font-bold text-[#C9261E] hover:underline cursor-pointer"
                    >
                      Use sample 14-digit code
                    </button>
                  </div>
                  <div className="mt-2 flex flex-col sm:flex-row gap-2.5">
                    <input
                      id="fssai-input"
                      type="text"
                      maxLength={14}
                      value={fssaiInput}
                      onChange={(e) => setFssaiInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="14-digit number"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#221B17] border border-[#E5D4A0] dark:border-[#5C4920] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E23428]/30"
                    />
                    <button
                      type="button"
                      onClick={handleCheckFssai}
                      className="px-5 py-2.5 rounded-xl movana-btn-gradient text-white text-[13px] font-extrabold shadow-xs whitespace-nowrap cursor-pointer"
                    >
                      Check licence code
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#7A6136] dark:text-[#C5B48B]">
                    Your code is checked automatically for the required FSSAI format and saved to
                    your stall profile.
                  </p>
                </div>
              </div>
            </section>

            {/* STEP 2: YOUR STALL & MENU (Screenshots 7, 8, 9) */}
            <section
              id="vendor-step-2"
              className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-5 sm:p-6 shadow-xs space-y-5"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#C9261E] text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h2 className="text-[17px] font-extrabold">Your stall &amp; menu</h2>
                  <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                    This is what customers see on the map. Delivery partners use your address for
                    pickup.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-bold mb-1.5">Stall name</label>
                  <input
                    type="text"
                    value={ownerStall.name}
                    onChange={(e) => updateOwnerStall({ name: e.target.value })}
                    placeholder="Your stall's name (e.g., Raju Chaat & Samosa Thela)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-bold mb-1.5">Stall type</label>
                    <select
                      value={ownerStall.stallType}
                      onChange={(e) =>
                        updateOwnerStall({ stallType: e.target.value as StallCategory })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                    >
                      <option value="Street food">🍛 Street food</option>
                      <option value="Vegetables">🥬 Vegetables</option>
                      <option value="Beverages">🫖 Beverages &amp; Chai</option>
                      <option value="Sweets & Snacks">🍬 Sweets &amp; Snacks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold mb-1.5">Map pin emoji</label>
                    <input
                      type="text"
                      value={ownerStall.pinEmoji}
                      onChange={(e) => updateOwnerStall({ pinEmoji: e.target.value })}
                      placeholder="e.g. 🥘"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-bold mb-1.5">Food type</label>
                    <select
                      value={ownerStall.foodType}
                      onChange={(e) =>
                        updateOwnerStall({ foodType: e.target.value as FoodDietaryType })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                    >
                      <option value="Veg and non-veg">Veg and non-veg</option>
                      <option value="Pure Veg">Pure Veg</option>
                      <option value="Non-veg">Non-veg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold mb-1.5">Public phone</label>
                    <input
                      type="tel"
                      value={ownerStall.publicPhone}
                      onChange={(e) => updateOwnerStall({ publicPhone: e.target.value })}
                      placeholder="10-digit number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm font-mono"
                    />
                    <p className="mt-1 text-[11px] text-[#8C7A70]">
                      Customers call this about an order.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold mb-1.5">Short description</label>
                  <input
                    type="text"
                    value={ownerStall.shortDescription}
                    onChange={(e) => updateOwnerStall({ shortDescription: e.target.value })}
                    placeholder="e.g. Crispy samosas & chai since 1998"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold mb-1.5">Allergens present</label>
                  <input
                    type="text"
                    value={ownerStall.allergens}
                    onChange={(e) => updateOwnerStall({ allergens: e.target.value })}
                    placeholder="e.g. nuts, milk, gluten, soy, egg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold mb-1.5">Stall address</label>
                  <textarea
                    rows={3}
                    value={ownerStall.address}
                    onChange={(e) => updateOwnerStall({ address: e.target.value })}
                    placeholder="Shop number, street, area, city"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                  />
                  <p className="mt-1 text-[11px] text-[#8C7A70]">
                    Shared with the delivery partner as the pickup point for every order.
                  </p>
                </div>

                {/* Get Paid by UPI (Screenshot 8) */}
                <div className="rounded-2xl border border-dashed border-[#DFC9B4] dark:border-[#4A3B31] bg-[#FDF9F4] dark:bg-[#1E1814] p-4 space-y-3">
                  <div className="flex items-center gap-2 font-extrabold text-[14px]">
                    <CreditCard className="w-4 h-4 text-[#E23428]" />
                    Get paid by UPI
                  </div>
                  <p className="text-[12px] text-[#6E5B52] dark:text-[#B8A79D]">
                    Customers pay you directly by UPI. Add your UPI ID, or upload your QR code and
                    Móvana will read the UPI ID from it.
                  </p>
                  <div>
                    <label className="block text-[12px] font-bold mb-1">Your UPI ID</label>
                    <input
                      type="text"
                      value={ownerStall.upiId}
                      onChange={(e) => updateOwnerStall({ upiId: e.target.value })}
                      placeholder="e.g. yourname@okaxis"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-white dark:bg-[#251D19] text-sm font-mono"
                    />
                    <p className="mt-1 text-[11px] text-[#8C7A70]">
                      Without a UPI ID, customers pay you at the stall.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold mb-1">
                      Upload your UPI QR code (optional)
                    </label>
                    <label className="flex items-center gap-3 px-3.5 py-2 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-white dark:bg-[#251D19] text-xs cursor-pointer hover:border-[#E23428]">
                      <Upload className="w-4 h-4 text-[#E23428]" />
                      <span>
                        {ownerStall.upiQrImage ? 'QR uploaded · Change image' : 'Choose file'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpiQrUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-[11px] text-[#8C7A70]">
                      Upload a screenshot of your QR from Google Pay, PhonePe or Paytm. Móvana reads
                      your UPI ID from it and makes its own QR for every order, with the amount
                      filled in automatically.
                    </p>
                  </div>
                </div>

                {/* Stall Photos (Screenshot 8) */}
                <div className="rounded-2xl border border-dashed border-[#DFC9B4] dark:border-[#4A3B31] bg-[#FDF9F4] dark:bg-[#1E1814] p-4 space-y-3">
                  <div className="flex items-center gap-2 font-extrabold text-[14px]">
                    <Camera className="w-4 h-4 text-[#E23428]" />
                    Stall photos
                  </div>
                  <p className="text-[12px] text-[#6E5B52] dark:text-[#B8A79D]">
                    Add up to 3 clear photos. The first becomes your cover image.
                  </p>
                  <label className="flex items-center gap-3 px-3.5 py-2 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-white dark:bg-[#251D19] text-xs cursor-pointer hover:border-[#E23428]">
                    <Upload className="w-4 h-4 text-[#E23428]" />
                    <span>Choose files ({ownerStall.photos.length}/3 uploaded)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleStallPhotosUpload}
                      className="hidden"
                    />
                  </label>
                  {ownerStall.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      {ownerStall.photos.map((src, i) => (
                        <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E5DBD0]">
                          <img
                            src={src}
                            alt={`Stall photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateOwnerStall({
                                photos: ownerStall.photos.filter((_, idx) => idx !== i),
                              })
                            }
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 text-white flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-[#8C7A70]">
                    Photos are resized in your browser before saving.
                  </p>
                </div>

                {/* Menu Builder (Screenshots 8 & 9) */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14.5px] font-extrabold">Menu</h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5ECE2] dark:bg-[#332720] text-[#6E5B52] dark:text-[#CFC0B7] tabular-nums">
                      {ownerStall.menu.length} items
                    </span>
                  </div>

                  {ownerStall.menu.length === 0 ? (
                    <div className="rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] bg-[#FDF9F4] dark:bg-[#1E1814] py-6 text-center text-xs text-[#7D6A60]">
                      No items yet. Add your first dish below.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ownerStall.menu.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#EAE0D5] dark:border-[#382C26] bg-[#FDFBF8] dark:bg-[#1C1613]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.photo ? (
                              <img
                                src={item.photo}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <span
                                className={`w-3.5 h-3.5 rounded-xs border-2 shrink-0 ${
                                  item.isVeg ? 'border-[#16A34A]' : 'border-[#DC2626]'
                                }`}
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-bold truncate">{item.name}</div>
                              <div className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                                {item.category} &middot;{' '}
                                <span className="font-mono font-bold text-[#24140E] dark:text-white">
                                  ₹{item.price}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOwnerMenuItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="p-1.5 text-[#8C7A70] hover:text-[#DC2626] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add a menu item subcard (Screenshot 9) */}
                  <div className="rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] p-4 space-y-3">
                    <h4 className="text-[13.5px] font-extrabold">Add a menu item</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                      <label className="sm:col-span-4 aspect-square rounded-xl border-2 border-dashed border-[#E23428]/50 bg-[#FFF8F5] dark:bg-[#2C1E1A] flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-[#FFF0EA] transition-colors overflow-hidden">
                        {dishPhoto ? (
                          <img
                            src={dishPhoto}
                            alt="Dish preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-[#E23428] mb-1.5" />
                            <span className="text-xs font-extrabold text-[#C9261E]">
                              Add dish photo
                            </span>
                            <span className="mt-1 text-[10.5px] text-[#7D6A60] leading-tight">
                              Take one now or choose from your gallery
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDishPhotoUpload}
                          className="hidden"
                        />
                      </label>

                      <div className="sm:col-span-8 space-y-3">
                        <div>
                          <label className="block text-xs font-bold mb-1">Item name</label>
                          <input
                            type="text"
                            value={dishName}
                            onChange={(e) => setDishName(e.target.value)}
                            placeholder="e.g. Cheese Pav Bhaji"
                            className="w-full px-3 py-2 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-bold mb-1">Price (₹)</label>
                            <input
                              type="number"
                              min={1}
                              value={dishPrice}
                              onChange={(e) => setDishPrice(e.target.value)}
                              placeholder="e.g. 80"
                              className="w-full px-3 py-2 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-1">Category</label>
                            <input
                              type="text"
                              value={dishCategory}
                              onChange={(e) => setDishCategory(e.target.value)}
                              placeholder="e.g. Pav Bhaji"
                              className="w-full px-3 py-2 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold">
                          <span className="text-[#6E5B52]">Food type</span>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              checked={dishIsVeg}
                              onChange={() => setDishIsVeg(true)}
                            />
                            <span className="text-[#16A34A]">● Veg</span>
                          </label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              checked={!dishIsVeg}
                              onChange={() => setDishIsVeg(false)}
                            />
                            <span className="text-[#DC2626]">● Non-veg</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Short description (optional)
                          </label>
                          <textarea
                            rows={2}
                            value={dishDesc}
                            onChange={(e) => setDishDesc(e.target.value)}
                            placeholder="e.g. Buttery pav bhaji topped with grated cheese"
                            className="w-full px-3 py-2 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMenuItem}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl movana-btn-gradient text-white text-xs font-extrabold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add item
                    </button>
                  </div>

                  {/* Save Stall CTA */}
                  <button
                    type="button"
                    onClick={saveOwnerStallToPlatform}
                    className="w-full py-3 rounded-xl movana-btn-gradient text-white text-sm font-extrabold shadow-md cursor-pointer"
                  >
                    Save stall
                  </button>
                  <div className="rounded-xl bg-[#FFF6D6] dark:bg-[#2F2616] px-3.5 py-2 text-[11.5px] text-[#7A5B1A] dark:text-[#E9C46A] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    Your cover photo and menu appear on the customer map once you&apos;re live.
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 3: VERIFICATION (Screenshots 9, 10, 13) */}
            <section
              id="vendor-step-3"
              className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#C9261E] text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h2 className="text-[17px] font-extrabold">Verification</h2>
                  <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                    The company reviews your details before you can go live.
                  </p>
                </div>
              </div>

              <div
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold border ${
                  ownerStall.verificationStatus === 'approved'
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]'
                    : ownerStall.verificationStatus === 'pending'
                      ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                      : 'bg-[#FDF6EE] dark:bg-[#2C221C] text-[#5B4940] dark:text-[#D9C7BD] border-[#EFE2D5] dark:border-[#42342C]'
                }`}
              >
                {ownerStall.verificationStatus === 'approved'
                  ? '✓ Verified by Móvana Company Admin! Proceed to Step 4 to go live.'
                  : ownerStall.verificationStatus === 'pending'
                    ? '⏳ Verification submitted — waiting for Company Admin approval.'
                    : 'Your stall must be verified by the company before it can go live.'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-bold mb-1">Owner&apos;s full name</label>
                  <input
                    type="text"
                    value={ownerStall.ownerName || ''}
                    onChange={(e) => updateOwnerStall({ ownerName: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-bold mb-1">Phone number</label>
                  <input
                    type="tel"
                    value={ownerStall.ownerPhone || ''}
                    onChange={(e) => updateOwnerStall({ ownerPhone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm font-mono"
                  />
                </div>
              </div>

              {/* Aadhaar Verification Box (Screenshot 10) */}
              <div className="rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] bg-[#FDFBF8] dark:bg-[#1D1714] p-4 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-extrabold">Aadhaar verification</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5ECE2] dark:bg-[#332720] text-[#7D6A60] dark:text-[#D5C3B7]">
                    {aadhaarSubmitted
                      ? `Ending in •••• ${ownerStall.aadhaarLast4}`
                      : 'Required'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Aadhaar number</label>
                  <input
                    type="text"
                    value={aadhaarRaw}
                    onChange={(e) => setAadhaarRaw(formatAadhaarInput(e.target.value))}
                    placeholder="0000 0000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#F7F1EA] dark:bg-[#251D19] font-mono text-sm tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Upload a clear photo of your Aadhaar card
                  </label>
                  <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#F7F1EA] dark:bg-[#251D19] text-xs cursor-pointer">
                    <Upload className="w-4 h-4 text-[#E23428]" />
                    <span>
                      {ownerStall.aadhaarPhoto ? 'Aadhaar photo attached ✓' : 'Choose file'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAadhaarPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-[11px] text-[#8C7A70]">
                    JPG, PNG or WebP &middot; up to 8 MB. Make sure the card details are readable.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 text-[11.5px] text-[#5B4940] dark:text-[#CFC0B7] leading-relaxed cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aadhaarConsent}
                    onChange={(e) => setAadhaarConsent(e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <span>
                    I consent to securely storing this Aadhaar image for manual onboarding review by
                    authorized Móvana admins. My typed full number will not be stored separately.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleSubmitAadhaar}
                  className="px-4 py-2 rounded-xl bg-[#EFE6DC] dark:bg-[#332720] hover:bg-[#E5D7C8] text-[#3B2B24] dark:text-[#FAF3EB] text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Submit Aadhaar for admin review
                </button>

                <p className="text-[11px] text-[#8C7A70] leading-relaxed">
                  Only the last 4 digits and private review record are saved. The original image is
                  restricted to your account and authorized admins. This is a manual review, not
                  UIDAI verification.
                </p>
              </div>

              <div>
                <label className="block text-[12.5px] font-bold mb-1">
                  FSSAI / vendor licence no. (optional)
                </label>
                <input
                  type="text"
                  value={ownerStall.fssaiNumber || ''}
                  onChange={(e) => updateOwnerStall({ fssaiNumber: e.target.value })}
                  placeholder="Licence number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] text-sm font-mono"
                />
              </div>

              <button
                type="button"
                onClick={submitOwnerForVerification}
                className="w-full py-3 rounded-xl border border-[#DFD5CC] dark:border-[#42352E] bg-white dark:bg-[#2B221D] hover:border-[#E23428] text-sm font-extrabold transition-colors cursor-pointer"
              >
                Submit for verification
              </button>
            </section>

            {/* STEP 4: GO LIVE (Screenshot 13) */}
            <section
              id="vendor-step-4"
              className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#C9261E] text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h2 className="text-[17px] font-extrabold">Go live</h2>
                  <p className="text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D]">
                    Share your GPS so customers can find you. Your pin follows you.
                  </p>
                </div>
              </div>

              {ownerStall.verificationStatus !== 'approved' ? (
                <div className="rounded-xl bg-[#FDF6EE] dark:bg-[#2C221C] border border-[#EFE2D5] dark:border-[#42342C] px-4 py-3 text-xs font-semibold text-[#6E5B52] dark:text-[#CFC0B7] flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                    Locked until the company verifies your stall.
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateToRole('admin')}
                    className="text-[#E23428] font-bold hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Admin review &rarr;
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] px-4 py-3 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Stall verified! Tap below to broadcast your live location to nearby customers.
                </div>
              )}

              <button
                type="button"
                onClick={toggleOwnerGoLive}
                className={`w-full py-3.5 rounded-xl text-white text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  ownerStall.isLive
                    ? 'bg-[#16A34A] hover:bg-[#15803D]'
                    : 'movana-btn-gradient'
                }`}
              >
                {ownerStall.isLive ? (
                  <>
                    <Radio className="w-4 h-4" /> Live on Customer Map — Tap to Go Offline
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" /> Go live
                  </>
                )}
              </button>
            </section>
          </div>

          {/* RIGHT STICKY COLUMN: Orders Unlock / Live Orders Manager (Screenshots 6–10) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            {ownerStall.verificationStatus !== 'approved' ? (
              <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-5 shadow-xs">
                <h3 className="text-[15.5px] font-extrabold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#D97706]" />
                  Orders unlock after verification
                </h3>
                <p className="mt-2 text-[12.5px] text-[#6E5B52] dark:text-[#B8A79D] leading-relaxed">
                  Finish the four steps on the left. Then new orders show up here in real time.
                </p>
                <ul className="mt-4 space-y-2.5 text-[12.5px] text-[#4A372E] dark:text-[#DFCFC3]">
                  <li className="flex items-center gap-2.5">
                    <span>🔔</span> Accept or reject each order
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span>🍳</span> Move it from preparing to ready
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span>🤝</span> Hand over to the customer or delivery partner
                  </li>
                </ul>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#221B17] border border-[#EAE0D5] dark:border-[#382C26] rounded-[20px] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-extrabold">Live Incoming Orders</h3>
                    <p className="text-xs text-[#6E5B52] dark:text-[#B8A79D]">
                      Manage customer prep &amp; handover in real time
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-extrabold tabular-nums">
                    {ownerOrders.filter((o) => o.status !== 'delivered').length} active
                  </span>
                </div>

                {ownerOrders.length === 0 ? (
                  <p className="text-xs text-[#6E5B52] py-6 text-center">
                    No customer orders yet. Place a test order from the Customer tab to see it
                    arrive here live!
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {ownerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-[#EAE0D5] dark:border-[#382C26] bg-[#FDFBF8] dark:bg-[#1B1512] p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#E23428]">
                            {ord.orderNumber} &middot; {ord.stallName}
                          </span>
                          <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#F5ECE2] dark:bg-[#332720]">
                            {ord.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-[#4A372E] dark:text-[#DFCFC3]">
                          {ord.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#6E5B52]">
                          <span>
                            {ord.customerName} ({ord.mode === 'dineout' ? 'Pickup' : 'Delivery'})
                          </span>
                          <span className="font-mono font-bold text-[#24140E] dark:text-white">
                            ₹{ord.subtotal}
                          </span>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-2">
                          {ord.status === 'placed' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(ord.id, 'accepted')}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-[#16A34A] text-white text-xs font-bold cursor-pointer"
                              >
                                Accept order
                              </button>
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                                className="py-1.5 px-3 rounded-lg border border-[#DC2626] text-[#DC2626] text-xs font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {ord.status === 'accepted' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'preparing')}
                              className="w-full py-1.5 px-3 rounded-lg bg-[#F59E0B] text-white text-xs font-bold cursor-pointer"
                            >
                              Start Preparing
                            </button>
                          )}
                          {ord.status === 'preparing' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'ready')}
                              className="w-full py-1.5 px-3 rounded-lg bg-[#E23428] text-white text-xs font-bold cursor-pointer"
                            >
                              Mark Ready for Pickup
                            </button>
                          )}
                          {ord.status === 'ready' && ord.mode === 'dineout' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(ord.id, 'delivered')}
                              className="w-full py-1.5 px-3 rounded-lg bg-[#16A34A] text-white text-xs font-bold cursor-pointer"
                            >
                              Handed Over to Customer ✓
                            </button>
                          )}
                          {ord.status === 'ready' && ord.mode === 'delivery' && (
                            <p className="text-[11px] text-[#16A34A] font-semibold">
                              Waiting for Móvana Delivery Partner pickup (Code: {ord.deliveryCode})
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      <MovanaFooter />

      {/* Hindi Walkthrough Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-white dark:bg-[#221B17] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EFE6DC] dark:border-[#382C26] flex items-center justify-between">
              <h3 className="font-extrabold text-base">
                FSSAI Registration — Hindi Walkthrough Guide
              </h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#F5ECE2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm text-[#4A372E] dark:text-[#DFCFC3]">
              <div className="rounded-xl bg-[#FDF6EB] dark:bg-[#2E241E] p-4 space-y-2.5">
                <p className="font-extrabold text-[#24140E] dark:text-white">
                  3 आसान चरणों में FSSAI पंजीकरण (₹100/वर्ष से शुरू):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs leading-relaxed">
                  <li>
                    <strong>foscos.fssai.gov.in</strong> खोलें और &ldquo;Apply for New License /
                    Registration&rdquo; चुनें।
                  </li>
                  <li>
                    अपना राज्य (जैसे Punjab) चुनें &rarr; &ldquo;Food Services / Petty Food
                    Business / Street Food Stall&rdquo; चुनें।
                  </li>
                  <li>
                    अपना नाम, ठेले का पता, पासपोर्ट फोटो और पहचान पत्र अपलोड करें। सबमिट करते ही
                    14-अंकों का FSSAI नंबर मिल जाएगा।
                  </li>
                </ol>
              </div>
              <div className="flex justify-end gap-2">
                <a
                  href="https://foscos.fssai.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E23428] text-white text-xs font-bold"
                >
                  Open FoSCoS Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFD5CC] text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track FoSCoS Application Modal */}
      {showTrackModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#221B17] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base">Track FSSAI Application</h3>
              <button
                type="button"
                onClick={() => setShowTrackModal(false)}
                className="p-1.5 rounded-lg hover:bg-[#F5ECE2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-[#6E5B52] dark:text-[#B8A79D]">
              Enter your 17-digit FoSCoS application reference number to check approval status.
            </p>
            <input
              type="text"
              value={trackRefNo}
              onChange={(e) => setTrackRefNo(e.target.value)}
              placeholder="e.g. 30261125104829102"
              className="mt-3 w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5CC] dark:border-[#3E322B] bg-[#FDFBF8] dark:bg-[#1B1512] font-mono text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTrackModal(false)}
                className="px-4 py-2 rounded-xl border border-[#DFD5CC] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(
                    trackRefNo.trim()
                      ? `Reference ${trackRefNo} checked — Ready for 14-digit FSSAI entry.`
                      : 'Please enter a reference number.',
                    trackRefNo.trim() ? 'success' : 'error'
                  );
                  if (trackRefNo.trim()) setShowTrackModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#E23428] text-white text-xs font-bold cursor-pointer"
              >
                Check status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
