export const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=900";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export function getVegetableImage(vegetable) {
  const imageUrl =
    vegetable?.imageUrl ||
    vegetable?.imageURL ||
    vegetable?.image;

  if (!imageUrl) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  // Agar already full URL hai
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // DB se /images/... aaya hai
  return `${BACKEND_URL}${imageUrl}`;
}
