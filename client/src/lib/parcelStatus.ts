import type { Parcel, ParcelSummary } from '@/types/parcel';

/**
 * Derives the real display status of a parcel.
 * A parcel marked 'ส่งถึงแล้ว' in the backend may actually still be
 * 'กำลังจัดส่ง' if the last recorded action was a forward, not a delivery.
 */
export function applyDerivedStatus(parcel: Parcel): Parcel {
  if (parcel['สถานะ'] !== 'ส่งถึงแล้ว') return parcel;

  const note = parcel['หมายเหตุ'] || '';
  const lastForwardIdx = note.lastIndexOf('[ส่งต่อโดย:');
  const lastProxyIdx   = note.lastIndexOf('[รับแทนโดย:');
  const lastNormalIdx  = note.lastIndexOf('[รับพัสดุเรียบร้อย');
  const maxIdx = Math.max(lastForwardIdx, lastProxyIdx, lastNormalIdx);

  // If the last action was a forward (not a delivery/proxy receipt), treat as in-transit
  if (maxIdx >= 0 && maxIdx === lastForwardIdx) {
    return { ...parcel, 'สถานะ': 'กำลังจัดส่ง' };
  }
  return parcel;
}

export function applyDerivedStatuses(parcels: Parcel[]): Parcel[] {
  return parcels.map(applyDerivedStatus);
}

export function summarizeParcels(parcels: Parcel[]): ParcelSummary {
  // Apply derived statuses first so forwarded parcels count correctly
  const derived = applyDerivedStatuses(parcels);
  const summary: ParcelSummary = { total: 0, pending: 0, transit: 0, delivered: 0 };
  for (const parcel of derived) {
    summary.total++;
    if (parcel['สถานะ'] === 'รอจัดส่ง')       summary.pending++;
    else if (parcel['สถานะ'] === 'กำลังจัดส่ง') summary.transit++;
    else if (parcel['สถานะ'] === 'ส่งถึงแล้ว')  summary.delivered++;
  }
  return summary;
}
