import { useEffect, useRef, useState } from 'react';
import { MapView } from './Map';
import type { TimelineEvent } from '@/types/timeline';

// Master Data: พิกัดของแต่ละสาขา
const BRANCH_COORDS: Record<string, google.maps.LatLngLiteral> = {
  "ศูนย์ใหญ่บางนา": { lat: 13.6682, lng: 100.6140 },
  "มหาชัย": { lat: 13.5489, lng: 100.2731 },
  "ศาลายา": { lat: 13.8005, lng: 100.3204 },
  "กาญจนา": { lat: 13.7225, lng: 100.4057 },
  "เซ็นทรัลพระราม 2": { lat: 13.6625, lng: 100.4398 },
  "เรียบด่วน": { lat: 13.8229, lng: 100.6272 },
  "เดอะมอลล์บางกะปิ": { lat: 13.7659, lng: 100.6415 },
  "มีนบุรี": { lat: 13.8130, lng: 100.7224 },
};

interface TrackingMapProps {
  events: TimelineEvent[];
}

const DEFAULT_CENTER = BRANCH_COORDS['ศูนย์ใหญ่บางนา'];

export default function TrackingMap({ events }: TrackingMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
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
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    } else {
      infoWindowRef.current.close();
    }

    if (!hasRouteData) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(7);
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
        'min-w-[56px] h-8 px-2 rounded-full border border-white shadow-lg',
        'text-[11px] font-semibold text-white flex items-center justify-center gap-1',
        isDestination ? 'bg-emerald-600' : 'bg-slate-700',
      ].join(' ');
      markerDiv.innerHTML = `${isLast ? '<span>🚚</span>' : '<span>📍</span>'}<span>${branchLabel.slice(0, 10)}</span>`;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: coord,
        title: branchLabel,
        content: markerDiv,
      });

      marker.addListener('click', () => {
        if (!infoWindowRef.current) return;
        infoWindowRef.current.setContent(`
          <div style="padding: 6px 8px; font-size: 13px;">
            <div style="font-weight: 600;">${branchLabel}</div>
            <div style="color: #6b7280; margin-top: 2px;">${isDestination ? 'จุดล่าสุดของพัสดุ' : 'จุดแวะพักระหว่างทาง'}</div>
          </div>
        `);
        infoWindowRef.current.open({ map, anchor: marker });
      });

      markersRef.current.push(marker);
    });

    // วาดเส้นทาง (Polyline)
    polylineRef.current = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map,
    });

    // ซูมและเลื่อนกล้องให้เห็นครบทุกจุด (Fit Bounds)
    if (pathCoordinates.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      pathCoordinates.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds);
      
      // ป้องกันการซูมใกล้เกินไป
      const listener = google.maps.event.addListener(map, "idle", function() { 
        if (map.getZoom()! > 14) map.setZoom(14); 
        google.maps.event.removeListener(listener); 
      });
    } else if (pathCoordinates.length === 1) {
      map.setCenter(pathCoordinates[0]);
      map.setZoom(13);
    }

  }, [hasRouteData, isMapReady, pathBranches.join(',')]);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border shadow-sm mt-6">
      <div className="bg-muted px-4 py-2 text-sm font-medium border-b border-border">
        🗺️ แผนที่เส้นทางการจัดส่ง
      </div>
      {!hasRouteData && (
        <div className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
          {!missingCoords ? 'ยังไม่มีข้อมูลตำแหน่งเส้นทางของพัสดุ แสดงศูนย์กระจายหลักแทน' : 'พบสาขาที่ไม่มีพิกัดใน Master Data แสดงศูนย์กระจายหลักแทน'}
        </div>
      )}
      <MapView 
        className="h-[300px] w-full"
        initialCenter={DEFAULT_CENTER}
        initialZoom={7}
        onMapReady={(map) => {
          mapRef.current = map;
          setIsMapReady(true);
        }} 
      />
    </div>
  );
}
