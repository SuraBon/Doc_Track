import { useParcelStoreContext } from '@/contexts/ParcelStoreContext';

export function useParcelStore() {
  return useParcelStoreContext();
}
