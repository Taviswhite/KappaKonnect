// Hook to handle notifications and push subscriptions
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/lib/notification-service";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const notification = payload.new;
          
          // Refresh notifications list
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
          queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
          queryClient.invalidateQueries({ queryKey: ["recent-notifications", user.id] });

          // Show browser notification if permission granted
          if (Notification.permission === "granted") {
            await notificationService.showNotification(notification.title, {
              body: notification.message,
              tag: notification.id,
              data: {
                url: notification.link || "/notifications",
                id: notification.id,
              },
            });
          }
        }
      )
      .subscribe();

    // Subscribe to push notifications if enabled
    const subscribeToPush = async () => {
      const { data: preferences } = await supabase
        .from("notification_preferences")
        .select("push_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (preferences?.push_enabled) {
        // Only request permission if it hasn't been granted yet
        if (Notification.permission === "default") {
          // Don't auto-request - user needs to enable it manually
          console.log("Push notifications enabled but permission not granted. User needs to enable manually.");
          return;
        }
        
        if (Notification.permission === "granted") {
          await notificationService.subscribeToPush(user.id);
        }
      }
    };

    subscribeToPush();

    // Handle notification clicks
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "NOTIFICATION_CLICK") {
          const { url } = event.data;
          if (url) {
            window.open(url, "_blank");
          }
        }
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
