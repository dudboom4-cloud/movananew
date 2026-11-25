import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Crosshair, Minus, Plus } from 'lucide-react';
import { Coordinates, Stall } from '../types/movana';

interface LiveStallMapProps {
  userCoords: Coordinates;
  stalls: Stall[];
  selectedStallId: string | null;
  onSelectStall: (stall: Stall) => void;
  onLocateMe: () => void;
}

export function LiveStallMap({
  userCoords,
  stalls,
  selectedStallId,
  onSelectStall,
  onLocateMe,
}: LiveStallMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [userCoords.lat, userCoords.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Re-center when userCoords change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([userCoords.lat, userCoords.lng], Math.max(map.getZoom(), 14), {
      animate: true,
    });
  }, [userCoords.lat, userCoords.lng]);

  // Render user dot and stall markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    // User location halo + blue dot matching Screenshot 5
    L.circle([userCoords.lat, userCoords.lng], {
      radius: 42,
      color: '#3B82F6',
      weight: 1.5,
      fillColor: '#60A5FA',
      fillOpacity: 0.22,
    }).addTo(layer);

    const userDotIcon = L.divIcon({
      className: 'movana-pin-wrapper',
      html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 2px 8px rgba(37,99,235,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([userCoords.lat, userCoords.lng], { icon: userDotIcon })
      .bindTooltip('You are here', { direction: 'top', offset: [0, -8] })
      .addTo(layer);

    // Live stall markers
    stalls.forEach((stall) => {
      const isSelected = stall.id === selectedStallId;
      const pinIcon = L.divIcon({
        className: 'movana-pin-wrapper',
        html: `
          <div style="
            display:flex;
            align-items:center;
            gap:5px;
            background:${isSelected ? '#E23428' : '#FFFFFF'};
            color:${isSelected ? '#FFFFFF' : '#24140E'};
            border:2px solid ${isSelected ? '#FFFFFF' : '#E23428'};
            border-radius:9999px;
            padding:4px 9px;
            font-size:12px;
            font-weight:700;
            white-space:nowrap;
            box-shadow:0 6px 16px rgba(36,20,14,0.22);
            transform:translate(-50%, -100%);
            cursor:pointer;
          ">
            <span style="font-size:14px;line-height:1;">${stall.pinEmoji || '🍛'}</span>
            <span>${stall.name.length > 18 ? stall.name.slice(0, 17) + '…' : stall.name}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([stall.coords.lat, stall.coords.lng], {
        icon: pinIcon,
      });
      marker.on('click', () => onSelectStall(stall));
      marker.addTo(layer);
    });
  }, [stalls, userCoords, selectedStallId, onSelectStall]);

  // Fly to selected stall when user clicks "Map" on a stall card
  useEffect(() => {
    if (!selectedStallId || !mapRef.current) return;
    const stall = stalls.find((s) => s.id === selectedStallId);
    if (stall) {
      mapRef.current.flyTo([stall.coords.lat, stall.coords.lng], 16, {
        duration: 0.65,
      });
    }
  }, [selectedStallId, stalls]);

  return (
    <div className="relative w-full h-[460px] lg:h-[520px] rounded-[22px] overflow-hidden border border-[#EAE0D5] dark:border-[#3A2F29] shadow-sm bg-[#EFECE6] dark:bg-[#231D19]">
      <div ref={containerRef} className="w-full h-full" />

      {/* Top-right locate crosshair button matching Screenshot 4 & 5 */}
      <button
        type="button"
        onClick={() => {
          onLocateMe();
          mapRef.current?.flyTo([userCoords.lat, userCoords.lng], 15, { duration: 0.5 });
        }}
        title="Center on my location"
        aria-label="Center map on my location"
        className="absolute top-3.5 right-3.5 z-[400] w-10 h-10 rounded-xl bg-white dark:bg-[#2B221D] border border-[#E5DBD0] dark:border-[#43362F] shadow-md flex items-center justify-center text-[#E23428] hover:bg-[#FFF5F2] transition-colors cursor-pointer"
      >
        <Crosshair className="w-4 h-4" />
      </button>

      {/* Bottom-right +/- zoom controls matching Screenshot 5 */}
      <div className="absolute bottom-7 right-3.5 z-[400] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-[#2B221D] border border-[#E5DBD0] dark:border-[#43362F] shadow-md">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="w-9 h-9 flex items-center justify-center text-[#24140E] dark:text-[#FAF3EB] hover:bg-[#FAF2E8] dark:hover:bg-[#3A2E27] border-b border-[#EFE6DC] dark:border-[#3A2E27] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="w-9 h-9 flex items-center justify-center text-[#24140E] dark:text-[#FAF3EB] hover:bg-[#FAF2E8] dark:hover:bg-[#3A2E27] cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
