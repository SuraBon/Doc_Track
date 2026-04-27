import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Parcel, ParcelSummary } from '@/types/parcel';
import * as parcelService from '@/lib/parcelService';
import { summarizeParcels } from '@/lib/parcelStatus';

interface ParcelStoreValue {
  parcels: Parcel[];
  summary: ParcelSummary | null;
  loading: boolean;
  error: string | null;
  loadParcels: (status?: string) => Promise<void>;
  loadSummary: () => Promise<void>;
  createParcel: (
    senderName: string,
    senderBranch: string,
    receiverName: string,
    receiverBranch: string,
    docType: string,
    description?: string,
    note?: string
  ) => Promise<string | null>;
  confirmReceipt: (trackingID: string, photoUrl: string, note?: string) => Promise<{ success: boolean; error?: string }>;
}

const ParcelStoreContext = createContext<ParcelStoreValue | null>(null);

export function ParcelStoreProvider({ children }: { children: ReactNode }) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [summary, setSummary] = useState<ParcelSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadParcels = useCallback(async (status: string = 'ทั้งหมด') => {
    setLoading(true);
    setError(null);
    try {
      const response = await parcelService.getParcels(status);
      if (response.success) {
        setParcels(response.parcels);
        if (status === 'ทั้งหมด') {
          setSummary(summarizeParcels(response.parcels));
        }
      } else {
        setError(response.error || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const data = await parcelService.exportSummary();
      if (data) setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  }, []);

  const createParcel = useCallback<ParcelStoreValue['createParcel']>(
    async (senderName, senderBranch, receiverName, receiverBranch, docType, description, note) => {
      setError(null);
      try {
        const response = await parcelService.createParcel(
          senderName,
          senderBranch,
          receiverName,
          receiverBranch,
          docType,
          description,
          note
        );
        if (!response.success) {
          setError(response.error || 'ไม่สามารถสร้างรายการได้');
          return null;
        }
        await loadParcels();
        await loadSummary();
        return response.trackingID || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
        return null;
      }
    },
    [loadParcels, loadSummary]
  );

  const confirmReceipt = useCallback<ParcelStoreValue['confirmReceipt']>(
    async (trackingID, photoUrl, note) => {
      setError(null);
      try {
        const response = await parcelService.confirmReceipt(trackingID, photoUrl, note);
        if (response.success) {
          await loadParcels();
          await loadSummary();
          return response;
        }
        setError(response.error || 'ไม่สามารถยืนยันการรับได้');
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
        setError(message);
        return { success: false, error: message };
      }
    },
    [loadParcels, loadSummary]
  );

  const value = useMemo(
    () => ({ parcels, summary, loading, error, loadParcels, loadSummary, createParcel, confirmReceipt }),
    [parcels, summary, loading, error, loadParcels, loadSummary, createParcel, confirmReceipt]
  );

  return <ParcelStoreContext.Provider value={value}>{children}</ParcelStoreContext.Provider>;
}

export function useParcelStoreContext() {
  const ctx = useContext(ParcelStoreContext);
  if (!ctx) throw new Error('useParcelStore must be used within ParcelStoreProvider');
  return ctx;
}
