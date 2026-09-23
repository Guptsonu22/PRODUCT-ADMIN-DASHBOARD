# Product Admin Dashboard

A small admin dashboard where an authenticated user can browse, search, filter, sort, and manage products. Built with Next.js + React + TypeScript + Tailwind CSS, using Axios against the free [DummyJSON API](https://dummyjson.com).

## Features

- Login with validation, loading state, and API error messages
- Protected product routes with logout
- Product list: table on desktop, cards on mobile
- Manual pagination (`limit`/`skip`, page sizes 10/20/50, "Showing X–Y of Z")
- Debounced search with stale-request cancellation
- Category filter, price/rating/title sorting
- All list state (page, pageSize, search, category, sort) kept in the URL
- Product details with image gallery and reviews, incl. not-found handling
- Add / edit form with validation (shared component), delete with confirmation
- Client-side mutation overlay so add/edit/delete stay visible during the session
- Loading, empty, and error states with working Retry buttons
- Responsive layout, accessible form controls

## Tech Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Axios. No React Query/SWR, no table/pagination libraries — that logic is hand-written.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Environment (`NEXT_PUBLIC_API_URL=https://dummyjson.com`):

```bash
cp .env.example .env.local
```

## Login Credentials

Test account from DummyJSON:

- username: `emilys`
- password: `emilyspass`

## API Endpoints Used

| Action         | Request                              |
| -------------- | ------------------------------------ |
| Login          | `POST /auth/login`                   |
| Product list   | `GET /products?limit=&skip=`         |
| Search         | `GET /products/search?q=`            |
| Categories     | `GET /products/categories`           |
| Category items | `GET /products/category/:slug`       |
| Details        | `GET /products/:id`                  |
| Add            | `POST /products/add`                 |
| Edit           | `PUT /products/:id`                  |
| Delete         | `DELETE /products/:id`               |

Sorting uses DummyJSON's `sortBy` + `order` query parameters.

## Architecture

```text
app/
  login/page.tsx            public login page (redirects to /products if authed)
  page.tsx                  root: redirects to /products or /login
  products/layout.tsx       AuthGuard + Header + ProductMutationProvider for all product routes
  products/page.tsx         list: URL parsing, fetching, merge, pagination
  products/new/page.tsx     add (reuses ProductForm)
  products/[id]/page.tsx    details (gallery, reviews, edit/delete)
  products/[id]/edit/page.tsx  edit (prefill, reuses ProductForm)
components/
  auth/          LoginForm, AuthGuard
  products/      ProductTable, ProductCard, ProductFilters, Pagination,
                 ProductForm, ProductImageGallery, ProductReviews,
                 DeleteConfirmModal, ProductSkeleton
  common/        Header, Loader, EmptyState, ErrorState
lib/             axios.ts (one shared instance), auth.ts (token/user storage)
services/        auth.service.ts, product.service.ts (all HTTP lives here)
hooks/           useDebounce.ts, useAuth.ts
context/         ProductMutationContext.tsx (local add/edit/delete overlay)
types/           auth.ts, product.ts
```

UI components never call Axios directly — they call service functions, which use the single shared instance.

## Important Design Decisions

1. **Axios architecture** — one instance in `lib/axios.ts` with the base URL from `NEXT_PUBLIC_API_URL`. A request interceptor attaches the token; a response interceptor clears auth and redirects on 401. Services are thin wrappers around it.
2. **Authentication** — login response token is stored in `localStorage` with the user object (`lib/auth.ts`), re-read onload so refresh keeps the session. This is a frontend-demo mechanism, not production-grade session management. Wrong credentials return 400 → friendly "Invalid username or password."
3. **URL state** — page, pageSize, search, category, sort live in the URL, which is the single source of truth. Filter/pagination components are presentational; only the list page updates the URL. Refreshing or sharing a link reproduces the view. Invalid values (`?page=abc`, `?pageSize=999`, unknown sort) normalize to safe defaults; out-of-range pages clamp.
4. **Debounced search** — the input updates local state instantly; a 450ms `useDebounce` pushes the settled value to the URL (resetting page to 1), and the fetch effect listens to the URL. Typing "phone" fires ~1 request, not 5.
5. **Stale request cancellation** — every fetch creates an `AbortController` whose signal is passed to the service; cleanup aborts the previous request. A slow `phone` response can never overwrite a newer `laptop` result (verified with `&delay=2000` vs `&delay=200`). Cancellations are swallowed, never shown as errors.
6. **Search + category limitation** — DummyJSON exposes separate search and category endpoints, so combining them would require client-side filtering with broken pagination. Search takes priority: the category dropdown is disabled while search is active and re-enables when cleared.
7. **DummyJSON mutation limitation** — POST/PUT/DELETE are simulated and never persist. The app keeps an in-memory overlay (`addedProducts`, `updatedProducts`, `deletedProductIds`) merged over server data (see CRUD behavior below).
8. **Invalid URL handling** — pure parse helpers (`parsePage`, `parsePageSize`, `parseSort`) coerce anything unexpected to defaults; the UI never throws.
9. **Responsive table/card design** — `hidden md:block` table vs `md:hidden` card grid from the same merged array; no table library.

## CRUD Behavior

Because DummyJSON simulates mutations without persisting them, the app maintains a client-side overlay in `ProductMutationContext` (plain React Context, in-memory):

- **Added** — created via `POST /products/add`, then stored locally with a timestamp ID (avoids colliding with DummyJSON's fixed simulated IDs) and shown on top of page 1 of the default list.
- **Updated** — sent via `PUT /products/:id`, then the local copy overrides the server row everywhere (list + details + edit prefill).
- **Deleted** — sent via `DELETE /products/:id` after modal confirmation, then the ID is hidden from list and details (details shows Not Found).

Server pagination is left intact; the overlay applies to the loaded page. Added rows appear only in the default view (no search/category/sort), since the server owns those result sets. **A full browser refresh clears the overlay** — session-level memory is an accepted, documented limitation.

## Challenge Faced

**Preventing stale search results from slow API responses.** Typing fast fired overlapping requests, and a slow earlier response could arrive last and replace newer results. It happened because each keystroke triggered its own fetch with no coordination. The fix: debounce the input (450ms) so fewer requests fire, and pass an `AbortController` signal through the service so starting a new request cancels the previous one; cancellation errors are ignored instead of displayed. Result: the visible list always matches the latest search term, verified with delayed API requests (`delay=2000` vs `delay=200`).

## AI Usage

AI assistance was used for brainstorming the file structure, understanding DummyJSON endpoint quirks (auth token shape, categories shape), code review, and implementation help. Every file was reviewed, tested (`tsc`, `lint`, `build`, plus live API checks), and understood — the code is deliberately kept simple enough to explain line by line in an interview.

## Deployment

```bash
npm run build
npm run start
```

On Vercel, set the environment variable `NEXT_PUBLIC_API_URL=https://dummyjson.com` and deploy the repository as a Next.js project.
