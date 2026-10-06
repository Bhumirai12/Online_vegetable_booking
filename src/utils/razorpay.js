function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Unable to load Razorpay checkout")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  payment,
  customer,
}) {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!key) {
    throw new Error(
      "VITE_RAZORPAY_KEY_ID is missing. Add it to your .env file."
    );
  }

  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key,
      amount: Math.round(Number(payment.amount) * 100),
      currency: "INR",
      name: "FreshBasket",
      description: `Payment for order #${payment.orderId}`,
      order_id: payment.razorpayOrderId,
      prefill: {
        name: customer?.fullName || "",
        email: customer?.email || "",
        contact: customer?.phone || "",
      },
      theme: {
        color: "#1f7a45",
      },
      handler: resolve,
      modal: {
        ondismiss: () => reject(new Error("Payment window closed")),
      },
    });

    checkout.open();
  });
}
