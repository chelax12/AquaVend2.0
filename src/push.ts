function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function enableWebPush(supabase: any, userId: string, unitId: string) {
  try {
    console.log("[push] start", { userId, unitId });

    if (!("serviceWorker" in navigator)) {
      throw new Error("serviceWorker not supported");
    }

    if (!("PushManager" in window)) {
      throw new Error("PushManager not supported");
    }

    console.log("[push] VAPID key:", import.meta.env.VITE_VAPID_PUBLIC_KEY);

    const permission = await Notification.requestPermission();
    console.log("[push] permission:", permission);

    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    const registration = await navigator.serviceWorker.register("/service-worker.js");
    console.log("[push] service worker registered:", registration);

    let subscription = await registration.pushManager.getSubscription();
    console.log("[push] existing subscription:", subscription);

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });
    }

    console.log("[push] new subscription:", subscription);

    const json = subscription.toJSON();
    console.log("[push] subscription json:", json);

    const payload = {
      user_id: userId,
      unit_id: unitId,
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    };

    console.log("[push] saving to supabase:", payload);

    const { data, error } = await supabase
      .from("push_subscriptions")
      .insert(payload)
      .select();

    console.log("[push] supabase response:", { data, error });

    if (error) throw error;

    alert("Push subscription saved successfully.");
  } catch (err) {
    console.error("[push] FAILED:", err);
    alert(`Push setup failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}