await fetch("https://xohzusvwwyrkqpnljtbh.supabase.co/functions/v1/send-alert-push", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    unit_id: "AQUA-VND-004",
    title: "AquaVend Alert",
    body: "Water level reached critical level",
  }),
});