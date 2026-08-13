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
    
    // Handle timeout
    if (err.name === 'AbortError') {
      throw new Error('Something went wrong. Please try again.');
    }
    
    // Handle network errors
    if (!navigator.onLine || err.message === 'Failed to fetch' || err.message === 'NetworkError') {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    
    // Re-throw if already user-friendly
    if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError')) {
      throw err;
    }
    
    throw new Error('Something went wrong. Please try again.');
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
      console.error('Approve seller error:', error);
      
      // Check for network errors
      if (!navigator.onLine || error.message === 'No internet connection. Please check your network and try again.') {
        return { success: false, error: 'No internet connection. Please check your network and try again.' };
      }
      
      if (error.message === 'Something went wrong. Please try again.') {
        return { success: false, error: error.message };
      }
      
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
      console.error('Reject seller error:', error);
      
      // Check for network errors
      if (!navigator.onLine || error.message === 'No internet connection. Please check your network and try again.') {
        return { success: false, error: 'No internet connection. Please check your network and try again.' };
      }
      
      if (error.message === 'Something went wrong. Please try again.') {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: error.message || 'Failed to reject seller' };
    }
  },
};