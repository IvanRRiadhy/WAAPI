import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../utils/axios'; // 🔜 Uncomment when backend is ready

// ── Types ──────────────────────────────────────────────────────────

export interface LicenseInfo {
  id: string;
  tenantId: string;
  maxAgents: number;
  maxUsers: number;
  monthlyQuota: number;
  dailyQuota: number;
  licenseKey: string;
  machineId: string;
  expiredAt: string;
  updatedAt: string;
  rawLicense: string;
}

// ── API Endpoints (for when backend is ready) ──────────────────────
const LICENSE_API_URL = '/api/licenses';

// ── Mock Helpers ───────────────────────────────────────────────────

// const DEFAULT_LICENSE: LicenseInfo = {
//   isValid: true,
//   validationMessage: 'License is active and valid.',
//   licenseType: 'Commercial',
//   licenseTier: 'Enterprise',
//   expirationDate: '2028-06-03',
//   dailyQuota: 1500,
//   monthlyQuota: 45000,
// };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Hooks ──────────────────────────────────────────────────────────

// ✅ Get license info
export function useLicenseInfo(enabled: boolean = true) {
  return useQuery({
    queryKey: ['license-info'],
    queryFn: async () => {
      await delay(200);
      const res = await axiosServices.get(LICENSE_API_URL);
      return res.data.collection as LicenseInfo;
    },
    enabled,
  });
}

// ✅ Activate / upload license file
export function useActivateLicense() {
  const queryClient = useQueryClient(); 

  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      await delay(500);
      console.log(`New license uploaded: ${file.name}`);
      const formData = new FormData();
      formData.append('file', file);
      const res = await axiosServices.post(`${LICENSE_API_URL}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
      // return { ...DEFAULT_LICENSE, expirationDate: '2029-06-03' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-info'] });
    },
  });
}
