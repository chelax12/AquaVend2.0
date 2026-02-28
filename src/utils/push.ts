import { supabase } from "../../lib/supabase";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

function arrayBufferToBase64(buffer: ArrayBuffer | null) {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
}

export async function subscribeToPushNotifications(): Promise<void> {
  try {
    const perm = await Notification.requestPermission();
    console.log("Permission result:", perm);

    if (perm !== "granted") {
      alert("Please allow notifications to enable alerts.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapidPublicKey) throw new Error("Missing VITE_VAPID_PUBLIC_KEY in env");

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log("Push subscription successful:", subscription);

    const p256dh = arrayBufferToBase64(subscription.getKey("p256dh"));
    const auth = arrayBufferToBase64(subscription.getKey("auth"));

    const { error } = await supabase.from("push_subscriptions").upsert({
      endpoint: subscription.endpoint,
      p256dh,
      auth,
    });

    if (error) throw error;

    alert("✅ You have been successfully subscribed to notifications!");
  } catch (error: any) {
    console.error("Failed to subscribe to push notifications:", error);
    console.error("name:", error?.name);
    console.error("message:", error?.message);
    console.error("stack:", error?.stack);
    alert(`❌ Failed: ${error?.name ?? ""} ${error?.message ?? ""}`.trim());
  }
}
