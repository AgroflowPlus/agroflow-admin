const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
}

export const sellerService = {
  // ── Get pending sellers ──────────────────────────────────────────
  async getPendingSellers(): Promise<any[]> {
    try {
      const res = await apiFetch(`${BASE_URL}/sellers/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('agroflow_token')}`,
        },
      });
      const data = await res.json();
      return data.sellers || [];
    } catch (error) {
      console.error('Get pending sellers error:', error);
      return [];
    }
  },

  // ── Admin: Approve seller ──────────────────────────────────────
  async approveSeller(sellerId: string, note?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await apiFetch(`${BASE_URL}/sellers/${sellerId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agroflow_token')}`,
        },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to approve seller' };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to approve seller' };
    }
  },

  // ── Admin: Reject seller ──────────────────────────────────────
  async rejectSeller(sellerId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await apiFetch(`${BASE_URL}/sellers/${sellerId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('agroflow_token')}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reject seller' };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reject seller' };
    }
  },
};