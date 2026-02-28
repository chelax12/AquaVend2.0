import { supabase } from "../../lib/supabase"; // adjust path if needed

function arrayBufferToBase64(buffer: ArrayBuffer | null) {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPushNotifications(): Promise<void> {
  try {
    // ✅ 1) Ask permission (this is missing in your code)
    const perm = await Notification.requestPermission();
    console.log("Permission result:", perm);

    if (perm !== "granted") {
      alert("Please allow notifications to enable alerts.");
      return;
    }

    // ✅ 2) Use existing registered SW (don’t re-register every click)
    const registration = await navigator.serviceWorker.ready;

    // ✅ 3) Get VAPID key from env
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) throw new Error("Missing VITE_VAPID_PUBLIC_KEY in env");

    // ✅ 4) Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log("Push subscription successful:", subscription);

    // ✅ 5) Save to Supabase (Option 1)
    const p256dh = arrayBufferToBase64(subscription.getKey("p256dh"));
    const auth = arrayBufferToBase64(subscription.getKey("auth"));

    const { error } = await supabase.from("push_subscriptions").upsert({
      endpoint: subscription.endpoint,
      p256dh,
      auth,
    });

    if (error) throw error;

    alert("✅ You have been successfully subscribed to notifications!");
  } } catch (error: any) {
  console.error("Failed to subscribe to push notifications:", error);
  console.error("name:", error?.name);
  console.error("message:", error?.message);
  console.error("stack:", error?.stack);

  alert(`❌ Failed: ${error?.name ?? ""} ${error?.message ?? ""}`.trim());

  }
