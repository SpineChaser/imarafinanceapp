# Imara Finance AI

Production-ready responsible AI microloan platform for East Africa, designed for ethical underwriting, transparent governance, auditability, and Kenya Data Protection Act (2019) compliance.

## What Is Included

- React + TypeScript + Vite frontend
- Tailwind design system using the requested color tokens and Plus Jakarta Sans
- Framer Motion page transitions and micro-interactions
- Recharts borrower segment visualization
- AI underwriting workflow with a secure Supabase Edge Function
- Claude assessment engine with JSON validation and retries
- Supabase PostgreSQL schema, RLS policies, and seed audit data
- Consent controls, governance dashboard, agent pipeline, kill-switch monitoring, appeals flow, and audit center

## Architecture

```text
React Frontend
  -> Supabase Edge Function: assess-application
      -> Anthropic Claude API
      -> JSON validation
      -> applications insert
      -> audit_logs insert
  -> Supabase PostgreSQL
      -> applications
      -> audit_logs
      -> consent_settings
      -> appeals
```

The frontend includes an offline local assessment fallback so reviewers can explore the product before connecting Supabase. In production, configure Supabase and Claude so every assessment is persisted and audited server-side.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add these values to `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Add these Supabase Edge Function secrets:

```bash
supabase secrets set ANTHROPIC_API_KEY=your-key
supabase secrets set ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

## Database

Run migrations:

```bash
supabase db push
```

The schema creates:

- `applications`
- `audit_logs`
- `consent_settings`
- `appeals`

RLS is enabled on all tables. Application and audit writes are restricted to the service role, while authenticated users can read operational data and manage their own consent settings. The `african_jurisdiction_only` consent control is enforced as true.

## Deploy Edge Functions

```bash
supabase functions deploy assess-application
supabase functions deploy submit-appeal
supabase functions deploy update-consent
```

The function:

1. Validates applicant input.
2. Calls Claude with a responsible lending system prompt.
3. Retries transient failures.
4. Validates Claude JSON.
5. Saves the application.
6. Writes an audit log.
7. Returns the assessment and application id.

`submit-appeal` saves appeal evidence and logs the appeal event. `update-consent` enforces African jurisdiction data sovereignty, upserts authenticated user consent, and logs the update.

## Production Notes

- Keep `ANTHROPIC_API_KEY` only in Supabase function secrets.
- Use Supabase Auth before exposing production dashboards.
- Add IP/user rate limiting at the edge gateway for public application intake.
- Run regular fairness monitoring by borrower segment, county, gender proxy review, approval rate, escalation rate, and appeal outcome.
- Review all policies with Kenyan legal counsel before regulated deployment.

## Verification

This workspace did not expose a usable local Node/npm runtime, so the project was generated and statically reviewed here. On a normal development machine, run:

```bash
npm run build
```

Then deploy with your preferred Vite host and Supabase project.
