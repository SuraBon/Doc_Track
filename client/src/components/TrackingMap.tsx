import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapView } from './Map';
import type { TimelineEvent } from '@/types/timeline';

// Master Data: พิกัดของแต่ละสาขา
const BRANCH_COORDS: Record<string, { lat: number; lng: number }> = {
  "MS": { lat: 13.6863417, lng: 100.5473102 },
  "พระประแดง": { lat: 13.6316148, lng: 100.5298312 },
  "บางนา": { lat: 13.6750005, lng: 100.5957341 },
  "มีนบุรี": { lat: 13.8158352, lng: 100.7511927 },
  "เลียบด่วน": { lat: 13.7831602, lng: 100.6073732 },
  "เดอะมอลล์บางกะปิ": { lat: 13.7657541, lng: 100.6421960 },
  "วิภาวดี": { lat: 13.8079029, lng: 100.5605981 },
  "พิบูลสงคราม": { lat: 13.8278215, lng: 100.5026199 },
  "พันธุ์สงคราม": { lat: 13.8278215, lng: 100.5026199 }, // alias รองรับข้อมูลเก่า
  "เดอะมอลล์บางแค": { lat: 13.7129595, lng: 100.4079480 },
  "มหาชัย": { lat: 13.5485480, lng: 100.2621752 },
  "ศาลายา": { lat: 13.7851938, lng: 100.2716878 },
  "กาญจนา": { lat: 13.6922140, lng: 100.4081029 },
  "เซ็นทรัล พระราม 2": { lat: 13.6634845, lng: 100.4375234 },
  "เซ็นทรัลพระราม 2": { lat: 13.6634845, lng: 100.4375234 }, // alias รองรับข้อมูลเก่า
};

interface TrackingMapProps {
  events: TimelineEvent[];
}

const DEFAULT_CENTER = BRANCH_COORDS['บางนา'];

export default function TrackingMap({ events }: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // ดึงสาขาที่มีพิกัดออกมาจาก Timeline
  const locations = events
    .map(e => e.location)
    .filter(loc => loc && BRANCH_COORDS[loc]) as string[];

  // กรองเฉพาะสถานที่ที่ไม่ซ้ำกันติดกัน (กันกรณีอยู่สาขาเดิม)
  const pathBranches = locations.filter((loc, index, arr) => index === 0 || loc !== arr[index - 1]);
  const missingCoords = events.some((event) => event.location && !BRANCH_COORDS[event.location]);
  const hasRouteData = pathBranches.length > 0;

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;
    const map = mapRef.current;

    // เคลียร์หมุดและเส้นเก่า
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (!hasRouteData) {
      map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 7);
      return;
    }

    const pathCoordinates = pathBranches.map(branch => BRANCH_COORDS[branch]);

    // สร้างหมุด (Markers)
    pathCoordinates.forEach((coord, index) => {
      const isLast = index === pathCoordinates.length - 1;

      // สร้างหมุดแบบไอคอน + ชื่อย่อสาขา
      const markerDiv = document.createElement('div');
      const branchLabel = pathBranches[index];
      const isDestination = index === pathCoordinates.length - 1;

      markerDiv.className = [
        'min-w-[64px] h-9 px-2 rounded-full border-2 border-white shadow-lg',
        'text-[11px] font-semibold text-white flex items-center justify-center gap-1',
        isDestination ? 'bg-emerald-600 ring-2 ring-emerald-200' : 'bg-slate-700',
      ].join(' ');
      markerDiv.innerHTML = `${isLast ? '<span>🚚</span>' : '<span>📍</span>'}<span>${branchLabel.slice(0, 10)}</span>`;

      const marker = L.marker([coord.lat, coord.lng], {
        icon: L.divIcon({
          html: markerDiv.outerHTML,
          className: 'branch-marker',
          iconSize: [90, 32],
          iconAnchor: [45, 16],
        }),
      });
      marker.bindPopup(`
        <div style="padding: 6px 8px; font-size: 13px; min-width: 180px;">
          <div style="font-weight: 700; color: #0f172a;">${branchLabel}</div>
          <div style="color: #475569; margin-top: 4px;">${isDestination ? 'จุดล่าสุดของพัสดุ (ปลายทางล่าสุด)' : 'จุดแวะพักระหว่างทาง'}</div>
          <div style="margin-top: 6px; font-size: 12px; color: #64748b;">คลิกนอก popup เพื่อปิด</div>
        </div>
      `, { autoPanPadding: [20, 20] });
      marker.addTo(map);

      markersRef.current.push(marker);
    });

    // วาดเส้นทาง (Polyline)
    polylineRef.current = L.polyline(
      pathCoordinates.map((coord) => [coord.lat, coord.lng] as [number, number]),
      {
        color: '#3b82f6',
        opacity: 0.8,
        weight: 4,
      }
    );
    polylineRef.current.addTo(map);

    if (pathCoordinates.length > 1) {
      const bounds = L.latLngBounds(pathCoordinates.map((coord) => [coord.lat, coord.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [20, 20] });
      if (map.getZoom() > 14) map.setZoom(14);
    } else if (pathCoordinates.length === 1) {
      map.setView([pathCoordinates[0].lat, pathCoordinates[0].lng], 13);
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    };
  }, [hasRouteData, isMapReady, pathBranches.join(',')]);

  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    });
  }, [isMapReady]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border shadow-sm mt-6 bg-card">
      {!hasRouteData && (
        <div className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
          {!missingCoords ? 'ยังไม่มีข้อมูลตำแหน่งเส้นทางของพัสดุ แสดงศูนย์กระจายหลักแทน' : 'พบสาขาที่ไม่มีพิกัดใน Master Data แสดงศูนย์กระจายหลักแทน'}
        </div>
      )}
      <MapView 
        className="h-[240px] md:h-[300px] w-full"
        initialCenter={DEFAULT_CENTER}
        initialZoom={7}
        onMapReady={(map) => {
          mapRef.current = map;
          setIsMapReady(true);
        }} 
      />
      <div className="px-3 py-2 border-t border-border bg-muted/40 text-xs text-muted-foreground flex items-center justify-between">
        <span>📍 จุดแวะพัก</span>
        <span>🚚 จุดล่าสุด</span>
      </div>
    </div>
  );
}
