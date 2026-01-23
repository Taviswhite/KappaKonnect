// Push Notification Service
// Handles PWA push notifications for the app

import { supabase } from "@/integrations/supabase/client";

export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications are not supported in this browser");
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.ready;
      
      // Request notification permission
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error initializing notification service:", error);
      return false;
    }
  }

  async subscribeToPush(userId: string) {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      console.error("Service worker not registered");
      return null;
    }

    try {
      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ""
        ),
      });

      // Send subscription to server
      const { data, error } = await supabase
        .from("push_subscriptions")
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        });

      if (error) {
        console.error("Error saving push subscription:", error);
        return null;
      }

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return null;
    }
  }

  async showNotification(title: string, options: NotificationOptions) {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted" && this.registration) {
      await this.registration.showNotification(title, {
        ...options,
        icon: "/web-app-manifest-192x192.png",
        badge: "/web-app-manifest-192x192.png",
      });
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
