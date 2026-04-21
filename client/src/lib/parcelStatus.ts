import type { Parcel, ParcelSummary } from '@/types/parcel';

export function applyDerivedStatus(parcel: Parcel): Parcel {
  if (parcel['สถานะ'] !== 'ส่งถึงแล้ว') return parcel;

  const note = parcel['หมายเหตุ'] || '';
  const lastForwardIdx = note.lastIndexOf('[ส่งต่อโดย:');
  const lastProxyIdx = note.lastIndexOf('[รับแทนโดย:');
  const lastNormalIdx = note.lastIndexOf('[รับพัสดุเรียบร้อย');
  const maxIdx = Math.max(lastForwardIdx, lastProxyIdx, lastNormalIdx);

  if (maxIdx >= 0 && maxIdx === lastForwardIdx) {
    return { ...parcel, 'สถานะ': 'กำลังจัดส่ง' };
  }
  return parcel;
}

export function applyDerivedStatuses(parcels: Parcel[]): Parcel[] {
  return parcels.map(applyDerivedStatus);
}

export function summarizeParcels(parcels: Parcel[]): ParcelSummary {
  let total = 0;
  let pending = 0;
  let transit = 0;
  let delivered = 0;

  parcels.forEach((parcel) => {
    total++;
    if (parcel['สถานะ'] === 'รอจัดส่ง') pending++;
    else if (parcel['สถานะ'] === 'กำลังจัดส่ง') transit++;
    else if (parcel['สถานะ'] === 'ส่งถึงแล้ว') delivered++;
  });

  return { total, pending, transit, delivered };
}
