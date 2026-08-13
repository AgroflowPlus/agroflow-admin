const BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-farmer-platform-backend-code.onrender.com/api';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return view;
}

// ── API fetch with timeout ──────────────────────────────────────────
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

export const pushService = {
  // ── Subscribe to push notifications ──────────────────────────────────
  async subscribe(): Promise<boolean> {
    try {
      console.log('🔔 Starting push subscription...');

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      console.log('✅ Push is supported');

      const permission = await Notification.requestPermission();
      console.log('📬 Notification permission:', permission);

      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      if (!VAPID_PUBLIC_KEY) {
        console.error('VAPID public key not configured');
        return false;
      }

      console.log('🔑 VAPID key found');

      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });

      console.log('✅ Push subscription created');

      const token = localStorage.getItem('agroflow_token') || localStorage.getItem('agf_token');
      if (!token) {
        console.warn('No auth token found');
        return false;
      }

      const response = await apiFetch(`${BASE_URL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to subscribe on server:', errorData);
        return false;
      }

      console.log('✅ Push subscription successful');
      return true;
    } catch (error: any) {
      console.error('Push subscription error:', error);
      
      // Check for network errors
      if (!navigator.onLine || error.message === 'No internet connection. Please check your network and try again.') {
        console.error('Network error: Please check your connection');
        return false;
      }
      
      if (error.message === 'Something went wrong. Please try again.') {
        console.error('Server error: Please try again later');
        return false;
      }
      
      return false;
    }
  },

  // ── Unsubscribe from push notifications ────────────────────────────
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Unsubscribed from push notifications');
      }
      
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    }
  },

  // ── Check if already subscribed ────────────────────────────────────
  async isSubscribed(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Check subscription error:', error);
      return false;
    }
  },
};