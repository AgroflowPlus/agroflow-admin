
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

export const pushService = {
  // ── Subscribe to push notifications ──────────────────────────────
  async subscribe(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      if (!VAPID_PUBLIC_KEY) {
        console.warn('VAPID public key not configured');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });

      const token = localStorage.getItem('agroflow_token') || localStorage.getItem('agf_token');
      if (!token) {
        console.warn('No auth token found');
        return false;
      }

      const response = await fetch(`${BASE_URL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        console.error('Failed to subscribe on server');
        return false;
      }

      console.log('✅ Push subscription successful');
      return true;
    } catch (error) {
      console.error('Push subscription error:', error);
      return false;
    }
  },

  // ── Unsubscribe from push notifications ───────
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

  // ── Check if already subscribed ──────────────────────────────────
  async isSubscribed(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  },
};