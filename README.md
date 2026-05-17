# AssetWise

AssetWise is an asset management workspace for tracking equipment, employee assignments, depreciation, categories, and AI-assisted inventory insights.

## Development

```bash
npm install
npm run dev
```

## Environment

Create a local `.env` file with Supabase project settings:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

`OPENAI_MODEL` and `OPENAI_BASE_URL` are optional. Configure `OPENAI_API_KEY` as a Supabase Edge Function secret before using the AI chat feature.

```bash
supabase secrets set OPENAI_API_KEY=your-api-key
supabase secrets set OPENAI_MODEL=gpt-4o-mini
```

## Scripts

- `npm run dev` starts the local Vite dev server.
- `npm run build` creates the production build.
- `npm run lint` runs ESLint.
