# FreshBasket React Frontend

React/Vite frontend for the Spring Boot OnlineVegetable backend.

## Run

```bash
npm install
npm run dev
```

Keep Spring Boot running on `http://localhost:8080`.

The Vite proxy forwards `/api/*` to Spring Boot, so the API service files keep short paths such as `/categories`, `/vegetables`, `/cart` and `/orders`.

## Customer routes

- `/` - Home
- `/vegetables` - Full vegetable catalogue
- `/categories` - Category selection
- `/orders` - Customer orders
- `/profile` - Customer profile
- `/checkout` - Checkout
- `/login`, `/register`, `/forgot-password`, `/reset-password` - Authentication

## Admin routes

- `/admin`
- `/admin/categories`
- `/admin/vegetables`
- `/admin/orders`
- `/admin/payments`

## Backend integration notes

- API files in `src/api/` were kept unchanged.
- JWT is stored in `localStorage` and attached automatically by `src/api/apiClient.js`.
- Product/category endpoints use live backend data after login.
- `imageUrl` is read from the vegetable response, with a fallback image for old records.
- The Home page contains previews only; full catalogue navigation uses React Router routes instead of `#categories` or `#products` hashes.

## Environment

Copy `.env.example` to `.env` if you use online payment.

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

Never place the Razorpay secret in the React frontend.
