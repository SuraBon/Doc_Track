/**
 * Parcel Service
 * ฟังก์ชันสำหรับเรียก Google Apps Script API
 */

import type {
  CreateParcelPayload,
  CreateParcelResponse,
  GetParcelsPayload,
  GetParcelsResponse,
  GetParcelPayload,
  GetParcelResponse,
  ExportSummaryResponse,
  ConfirmReceiptPayload,
  ConfirmReceiptResponse,
  ParcelSummary,
  Parcel,
} from '@/types/parcel';
import { applyDerivedStatus, applyDerivedStatuses } from './parcelStatus';

const GAS_URL = import.meta.env.VITE_GAS_URL || '';
const GAS_API_KEY = import.meta.env.VITE_GAS_API_KEY || '';
const LEGACY_DEFAULT_BRANCHES = [
  'ศูนย์ใหญ่บางนา',
  'มหาชัย',
  'ศาลายา',
  'กาญจนา',
  'เซ็นทรัลพระราม 2',
  'เรียบด่วน',
  'เดอะมอลล์บางกะปิ',
  'มีนบุรี',
];
const DEFAULT_BRANCHES = [
  'MS',
  'พระประแดง',
  'บางนา',
  'มีนบุรี',
  'เลียบด่วน',
  'เดอะมอลล์บางกะปิ',
  'วิภาวดี',
  'พิบูลสงคราม',
  'เดอะมอลล์บางแค',
  'มหาชัย',
  'ศาลายา',
  'กาญจนา',
  'เซ็นทรัล พระราม 2',
];
const CONFIG_UPDATED_EVENT = 'parcel-config-updated';

export function getGasUrl() {
  return GAS_URL;
}

const storedBranches = JSON.parse(localStorage.getItem('branches') || 'null') as string[] | null;
const isLegacyBranches =
  Array.isArray(storedBranches) &&
  storedBranches.length === LEGACY_DEFAULT_BRANCHES.length &&
  storedBranches.every((branch, index) => branch === LEGACY_DEFAULT_BRANCHES[index]);

let BRANCHES = !storedBranches || isLegacyBranches ? DEFAULT_BRANCHES : storedBranches;

export function setBranches(branches: string[]) {
  BRANCHES = branches;
  localStorage.setItem('branches', JSON.stringify(branches));
  window.dispatchEvent(new Event(CONFIG_UPDATED_EVENT));
}

export function getBranches() {
  return BRANCHES;
}

export function isConfigured() {
  return !!GAS_URL && BRANCHES.length > 0;
}

export function onConfigUpdated(listener: () => void) {
  window.addEventListener(CONFIG_UPDATED_EVENT, listener);
  return () => window.removeEventListener(CONFIG_UPDATED_EVENT, listener);
}

async function callAPI<T>(payload: any): Promise<T | null> {
  if (!GAS_URL) {
    throw new Error('กรุณาตั้งค่า Google Apps Script URL ก่อน');
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ ...payload, apiKey: GAS_API_KEY }),
      headers: { 'Content-Type': 'text/plain' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function createParcel(
  senderName: string,
  senderBranch: string,
  receiverName: string,
  receiverBranch: string,
  docType: string,
  description?: string,
  note?: string
): Promise<CreateParcelResponse> {
  const payload: CreateParcelPayload = {
    action: 'createParcel',
    senderName,
    senderBranch,
    receiverName,
    receiverBranch,
    docType,
    description,
    note,
  };

  const response = await callAPI<any>(payload);
  if (response) {
    return {
      success: response.success,
      trackingID: response.trackingID || response.trackingId,
      error: response.error,
    };
  }
  return { success: false };
}

export async function getParcels(status: string = 'ทั้งหมด'): Promise<GetParcelsResponse> {
  const payload: GetParcelsPayload = {
    action: 'getParcels',
    status,
  };

  const response = await callAPI<GetParcelsResponse>(payload);
  if (response && response.success && response.parcels) {
    response.parcels = applyDerivedStatuses(response.parcels);
    if (status !== 'ทั้งหมด') {
      response.parcels = response.parcels.filter((p) => p['สถานะ'] === status);
    }
    return response;
  }
  return { success: false, parcels: [] };
}

export async function getParcel(trackingID: string): Promise<GetParcelResponse> {
  const payload: GetParcelPayload = {
    action: 'getParcel',
    trackingID,
  };

  const response = await callAPI<GetParcelResponse>(payload);
  if (response && response.success && response.parcel) {
    response.parcel = applyDerivedStatus(response.parcel);
    return response;
  }
  return { success: false };
}

export async function exportSummary(): Promise<ParcelSummary | null> {
  const payload = { action: 'exportSummary' };

  const response = await callAPI<ExportSummaryResponse>(payload);
  return response?.summary || null;
}

export async function confirmReceipt(
  trackingID: string,
  photoUrl: string,
  note?: string
): Promise<ConfirmReceiptResponse> {
  const payload: ConfirmReceiptPayload = {
    action: 'confirmReceipt',
    trackingID,
    photoUrl,
    note,
  };

  return (await callAPI<ConfirmReceiptResponse>(payload)) || { success: false };
}

export async function searchParcels(query: string): Promise<Parcel[]> {
  const response = await callAPI<{ success: boolean; parcels?: Parcel[] }>({
    action: 'searchParcels',
    query,
  });
  if (response?.success && response.parcels) {
    return applyDerivedStatuses(response.parcels);
  }
  return [];
}
