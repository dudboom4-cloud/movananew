import React from 'react';

export function MovanaLogo({
  variant = 'light',
  className = '',
}: {
  variant?: 'light' | 'brand';
  className?: string;
}) {
  const isLight = variant === 'light';
  return (
    <span className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 ${className}`}>
      <span
        className={`w-8 h-8 rounded-[10px] flex items-center justify-center shadow-sm ${
          isLight ? 'bg-white text-[#E22D25]' : 'bg-[#E22D25] text-white'
        }`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
          <path d="M12 3.2c.55 3.9 2.9 6.25 6.8 6.8-3.9.55-6.25 2.9-6.8 6.8-.55-3.9-2.9-6.25-6.8-6.8 3.9-.55 6.25-2.9 6.8-6.8Z" />
        </svg>
      </span>
      <span
        className={`text-[21px] font-extrabold tracking-tight ${
          isLight ? 'text-white' : 'text-[#24140E] dark:text-[#FAF3EB]'
        }`}
      >
        móvana
      </span>
    </span>
  );
}

export function ScallopedAwning({ compact = false }: { compact?: boolean }) {
  const stripes = Array.from({ length: 12 });
  return (
    <div className="w-full overflow-hidden select-none" aria-hidden="true">
      <div className={`grid grid-cols-12 w-full ${compact ? 'h-5' : 'h-12'}`}>
        {stripes.map((_, idx) => (
          <div
            key={idx}
            className={`relative ${
              idx % 2 === 0 ? 'bg-[#E23428]' : 'bg-[#FCE7A5]'
            }`}
          >
            <div
              className={`absolute left-0 right-0 -bottom-2.5 h-5 rounded-b-full ${
                idx % 2 === 0 ? 'bg-[#E23428]' : 'bg-[#FCE7A5]'
              }`}
              style={{ boxShadow: '0 3px 6px rgba(90,20,10,0.12)' }}
            />
          </div>
        ))}
      </div>
      <div className="h-3" />
    </div>
  );
}

export function ThelaCartIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
      {/* Canopy */}
      <path d="M8 14L11 8H30L33 14H8Z" fill="#E5392F" />
      <path d="M13 8L12 14H17L17.5 8H13Z" fill="#FCE7A5" />
      <path d="M22.5 8L23 14H28L27 8H22.5Z" fill="#FCE7A5" />
      {/* Poles */}
      <rect x="10.5" y="14" width="2" height="9" fill="#8C4B27" />
      <rect x="28.5" y="14" width="2" height="9" fill="#8C4B27" />
      {/* Food / Veggie mounds */}
      <circle cx="16" cy="21" r="3" fill="#4CAF50" />
      <circle cx="21" cy="20.5" r="3.2" fill="#FF9800" />
      <circle cx="25.5" cy="21.5" r="2.6" fill="#E5392F" />
      {/* Wooden Cart Body */}
      <rect x="8" y="22" width="25" height="6.5" rx="2" fill="#2E7D32" />
      <path d="M33 24.5H37.5" stroke="#5D4037" strokeWidth="2.2" strokeLinecap="round" />
      {/* Wheels */}
      <circle cx="14" cy="30.5" r="3.8" fill="#3E2723" stroke="#D7CCC8" strokeWidth="1.2" />
      <circle cx="27" cy="30.5" r="3.8" fill="#3E2723" stroke="#D7CCC8" strokeWidth="1.2" />
    </svg>
  );
}

export function CustomerBowlArt() {
  return (
    <div className="relative w-28 h-28 shrink-0 select-none" aria-hidden="true">
      <div className="absolute inset-1 rounded-full bg-[#FBBF24]/45" />
      <svg viewBox="0 0 120 120" className="relative w-full h-full">
        {/* Steam */}
        <path
          d="M48 44c-3-6 3-10 0-16M60 40c-3-6 3-10 0-16M72 44c-3-6 3-10 0-16"
          stroke="#FFF7E6"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        {/* Chopsticks */}
        <line x1="68" y1="68" x2="98" y2="28" stroke="#4E2A1A" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="74" y1="70" x2="105" y2="34" stroke="#6B3A24" strokeWidth="2.8" strokeLinecap="round" />
        {/* Soup */}
        <ellipse cx="60" cy="68" rx="34" ry="11" fill="#FDE68A" />
        <ellipse cx="60" cy="68" rx="28" ry="8" fill="#F59E0B" />
        <circle cx="52" cy="67" r="3" fill="#EF4444" />
        <circle cx="65" cy="69" r="2.5" fill="#16A34A" />
        {/* Bowl */}
        <path
          d="M26 68c0 19 15 32 34 32s34-13 34-32H26Z"
          fill="#FFFDF9"
        />
        <rect x="44" y="98" width="32" height="5" rx="2.5" fill="#F3E6D3" />
        {/* Dots on bowl */}
        <circle cx="42" cy="78" r="2" fill="#E5392F" />
        <circle cx="51" cy="78" r="2" fill="#E5392F" />
        <circle cx="60" cy="78" r="2" fill="#E5392F" />
        <circle cx="69" cy="78" r="2" fill="#E5392F" />
        <circle cx="78" cy="78" r="2" fill="#E5392F" />
      </svg>
      {/* Floating bread badge */}
      <div className="absolute -left-1 top-3 w-8 h-8 rounded-lg bg-[#FFF8EB] shadow-md flex items-center justify-center text-sm -rotate-12">
        🍞
      </div>
      {/* Floating carrot badge */}
      <div className="absolute right-0 -top-1 w-8 h-8 rounded-lg bg-[#FFF8EB] shadow-md flex items-center justify-center text-sm rotate-12">
        🥕
      </div>
    </div>
  );
}

export function FoodDeliveryPlateArt() {
  return (
    <svg viewBox="0 0 110 76" className="w-24 h-16 shrink-0" fill="none" aria-hidden="true">
      <ellipse cx="55" cy="40" rx="46" ry="30" fill="#F3F0EB" stroke="#DCD5CC" strokeWidth="2" />
      <ellipse cx="55" cy="40" rx="37" ry="23" fill="#FFFFFF" />
      {/* Golden samosa / snack */}
      <path d="M51 26L74 23L71 45L48 42Z" fill="#D98A3A" stroke="#A8601C" strokeWidth="1.5" />
      {/* Curry bowl */}
      <circle cx="42" cy="41" r="8" fill="#F59E0B" />
      <circle cx="42" cy="41" r="5" fill="#FBBF24" />
      {/* Garnish berries / chutney */}
      <circle cx="63" cy="52" r="3.5" fill="#B91C1C" />
      <circle cx="71" cy="50" r="3.2" fill="#DC2626" />
      <circle cx="68" cy="55" r="2.8" fill="#991B1B" />
    </svg>
  );
}

export function DineoutPlateArt() {
  return (
    <svg viewBox="0 0 88 88" className="w-20 h-20 shrink-0" fill="none" aria-hidden="true">
      <circle cx="44" cy="44" r="34" fill="#4B5563" />
      <circle cx="44" cy="44" r="24" fill="#FFFFFF" />
      {/* Fork & Knife */}
      <rect x="37" y="30" width="2.5" height="28" rx="1.2" fill="#CBD5E1" />
      <path d="M35 30V38M38.2 30V38M41.5 30V38" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="48" y="30" width="3" height="28" rx="1.5" fill="#CBD5E1" />
      <path d="M48 30C51.5 30 53 33 53 38H48V30Z" fill="#94A3B8" />
    </svg>
  );
}
