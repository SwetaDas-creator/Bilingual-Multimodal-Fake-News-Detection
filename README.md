# Bilingual Multimodal Fake News Detection: Frontend

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Lucide icons

## Run locally

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open http://localhost:3000

Requires Node.js 18.18+ (Node 20+ recommended).

## Mock API vs real backend

- With `NEXT_PUBLIC_API_URL` unset or empty, `/detect` uses a built-in **mock API** (random placeholder verdicts; results are labelled "Demo mode").
- Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local` to call the FastAPI backend.
  The frontend sends `POST {API_URL}/api/predict` as `multipart/form-data` with fields
  `mode`, `language`, `text` (optional), `image` (optional), and expects JSON matching
  `DetectionResponse` in `types/detection.ts`.
- To change the endpoint path or response mapping, edit `realDetect()` in `lib/api.ts`.

## Things to fill in

- `app/contact/page.tsx`: team names, supervisor, email
- `app/models/page.tsx`: dataset details
- `app/results/page.tsx`: metrics table, confusion matrices, training curves

## Structure

```
app/            pages (/, /detect, /how-it-works, /about, /models, /results, /contact)
components/     layout (Navbar, Footer), detect (ImageUploader, ResultCard), ui
lib/            api.ts (mock + real), validation.ts
types/          shared TypeScript types
```
