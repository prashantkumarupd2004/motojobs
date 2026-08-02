# Production Deployment — motojobs.in

Stack: **App Runner** (app) + **Supabase Postgres** (db) + **Resend** (email) + **S3** (uploads), region `ap-south-1` (Mumbai).

Do the steps in order. Domain verification in Resend needs DNS propagation, so **start with Part 1 today** — everything else can proceed while you wait.

---

## Part 1 — Resend (start this first)

### 1.1 Verify the domain

Resend Dashboard → **Domains** → *Add Domain* → `motojobs.in`.

Resend then shows the exact DNS records for the next step. It provisions a `send.motojobs.in` MAIL FROM subdomain automatically, which keeps the bounce path off the root and aligns SPF with your From address.

> **Done — verified 2026-08-02.** Domain id `1ca05af2-bc7f-4264-808f-20d750c87e67`,
> region `us-east-1`, sending **enabled**, all three DNS records reading `verified`.
> The section below is kept for reference and for rebuilding the records if DNS is
> ever migrated.

### 1.2 DNS records

> **Your domain already runs Google Workspace.** Checked live on 2026-08-01:
> `MX → 1 smtp.google.com`, Google DKIM published at `google._domainkey`,
> DMARC at `p=quarantine`, and **no SPF record at all**.
>
> Adding Resend alongside Workspace is fine — but read the three warnings below
> before touching DNS, because two of them can break your existing email.

These are the records now live on the domain:

| Type  | Name                            | Value                                        | Note |
|-------|---------------------------------|----------------------------------------------|------|
| TXT   | `resend._domainkey.motojobs.in` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5r9J7n7rGjH1GLQdeY3IyuXmBH+NMSyG8qkawq/3XyB8oOHOWZYJSb5j/Jet2M/9PLwghU/KCPOMe3+cBhfaX1XviFxXa2TK0saV0CiZEEuZJXzaj2VLmzx2vC4Xmrr502SHt+EREQIfyuHnO2tQQpz7nC46Ht301ZmECH7lbAwIDAQAB` | DKIM |
| MX    | `send.motojobs.in`              | `10 feedback-smtp.us-east-1.amazonses.com`   | MAIL FROM subdomain — **not** the root |
| TXT   | `send.motojobs.in`              | `"v=spf1 include:amazonses.com ~all"`        | MAIL FROM SPF |
| TXT   | `motojobs.in`                   | `"v=spf1 include:_spf.google.com ~all"`      | Workspace only — **see #1** |

Resend's DKIM sits at `resend._domainkey` and Google's at `google._domainkey`. Different names, so they coexist — do not delete the Google record.

Note the MAIL FROM host is `us-east-1`, not `ap-south-1`: Resend relays through its own infrastructure, and its region is independent of where App Runner runs. This is not a misconfiguration and does not need fixing.

---

#### ⚠️ 1 — You have no SPF record. Publish one for Workspace.

Right now `motojobs.in` publishes only a `google-site-verification` TXT. No SPF at all. That means your Workspace mail is currently unauthenticated by SPF and leaning entirely on DKIM.

Publish exactly one SPF TXT at the root:

```
v=spf1 include:_spf.google.com ~all
```

Resend does **not** need an include here — its bounce path lives on `send.motojobs.in`, which carries its own SPF record, and relaxed DMARC alignment (`aspf=r`) lets that subdomain align with a `motojobs.in` From address.

Never create two SPF records — a domain with two SPF TXTs is a `permerror`, and **both** Workspace and Resend mail start failing. One record at the root, one on the subdomain.

#### ⚠️ 2 — Your DMARC is already at `p=quarantine`.

Current record:

```
v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;
```

This is stricter than the `p=none` starting point in most guides — it means **any message failing both SPF and DKIM goes to spam immediately.** There is no soft-launch grace period. If Resend's DKIM isn't verified before your first signup email, that OTP lands in spam.

So the order matters: **confirm the domain shows "Verified" in Resend and send yourself a test before pointing real signups at it.** Do not relax `p=quarantine` to `p=none` — your domain is better off where it is. Relaxed alignment (`adkim=r`, `aspf=r`) is already set, which is what lets the `send.motojobs.in` MAIL FROM subdomain align with a `motojobs.in` From address.

Also worth noting: DMARC reports currently go to `dmarc_rua@onsecureserver.net` — a hosting provider's address, not yours. You won't see authentication failures. Consider adding your own:

```
v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net,mailto:dmarc@motojobs.in; fo=1
```

#### ⚠️ 3 — The MAIL FROM MX goes on `send.motojobs.in`, never the root.

Your root MX is `1 smtp.google.com` and it must stay exactly that. Resend's MAIL FROM record is a **separate hostname** (`send.motojobs.in`).

If you add that MX at the root by mistake, inbound Google Workspace mail breaks immediately. Double-check the Name field says `send` and not `@` before saving.

---

Verification typically completes in 15–60 min. Status must read **Verified** before sending.

### 1.3 Create the receiving mailbox

`noreply@` only needs to *send*, but `support@motojobs.in` must actually **receive** — it's the `Reply-To` on every email and users will reply to it. An unmonitored Reply-To hurts sender reputation.

You already have Google Workspace, so the cheapest route is a **group**, not a new licensed user:

Google Admin → **Directory → Groups** → create `support@motojobs.in` → add yourself as a member → set *Who can post* to **Anyone on the internet** (external users must be able to reply).

A group costs nothing extra; a new Workspace user costs a full licence.

Do **not** create a `noreply@` mailbox. Resend sends from that address without it existing as a Workspace user — and leaving it unroutable is intentional, since replies should go to `support@`.

### 1.4 API key

Resend Dashboard → **API Keys** → *Create API Key*, permission **Sending access**, scoped to the `motojobs.in` domain.

The key is shown once. Set it as `RESEND_API_KEY` in App Runner's environment (Part 4) — it is the only email credential the app needs. Leave it unset and email drops to dev mode: the OTP is logged to the console instead of sent.

> **Done.** A key exists and is set in the local `.env` (gitignored). It is *not* yet
> in Secrets Manager or App Runner — see Part 4.4.

### 1.5 Sending limits

The free tier allows 3,000 emails/month and 100/day, which covers early signups. There is no sandbox and no 24–48h approval queue — sending to real addresses works as soon as the domain verifies. Upgrade in the dashboard when daily volume approaches the cap.

Resend tracks bounces and complaints per-domain automatically; no configuration set to create.

### 1.6 Verify DNS from your machine

Once records propagate:

```bash
# Exactly ONE spf1 line at the root, containing _spf.google.com
dig +short TXT motojobs.in | grep spf1

# Must still be: 1 smtp.google.com  — if this changed, Workspace inbound is broken
dig +short MX motojobs.in

# Resend MAIL FROM, on the subdomain only
dig +short MX send.motojobs.in
dig +short TXT send.motojobs.in

# Both DKIM keys must resolve
dig +short TXT resend._domainkey.motojobs.in
dig +short TXT google._domainkey.motojobs.in
```

If the first command returns **two** lines, stop and merge them — two SPF records is a `permerror` that breaks Workspace and Resend together.

After go-live, send a test to `check-auth@verifier.port25.com` — it replies with a full SPF/DKIM/DMARC report. Do this **twice**: once from the app (Resend path) and once from Gmail (Workspace path). Both must pass, because your `p=quarantine` policy gives no margin.

---

## Part 2 — Supabase Postgres (free tier)

Supabase rather than RDS, for cost. RDS on `db.t4g.micro` runs ~$18/mo, but the larger
charge is indirect: a private RDS instance forces an App Runner **VPC connector**, and a
VPC connector removes App Runner's default internet egress, so reaching Resend/S3/OpenAI then
requires a **NAT Gateway** at ~$33/mo. Supabase is a public TLS endpoint, so both
disappear. Total saved: ~$51/mo.

Free tier gives 500 MB database and 5 GB egress — ample here, since resumes live in S3 and
the database holds only rows. What you give up is covered under *Known gaps*.

### 2.1 Create the project

[supabase.com](https://supabase.com) → *New project*

| Setting | Value |
|---|---|
| Region | **South Asia (Mumbai) `ap-south-1`** |
| Database password | generate a strong one |
| Plan | Free |

The region **must** match App Runner. Prisma makes several round-trips per request, so a
cross-region project (e.g. Singapore) adds latency to every one of them.

Store the database password in **Secrets Manager** — never as plaintext.

### 2.2 Connection strings

Dashboard → **Connect**. Take *both* strings; they differ only in port:

```
# App runtime — transaction pooler
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5"

# Prisma CLI / migrations — session pooler
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

Three things here are load-bearing:

- **`pgbouncer=true`** — the transaction pooler has no prepared statements, which Prisma
  creates by default. Without this flag you get `prepared statement "s0" already exists`
  under any real concurrency.
- **`connection_limit=5`** — App Runner is a long-lived container serving concurrent
  requests, and `/api/admin/analytics` alone fans out ~11 queries in one `Promise.all`.
  Do **not** set this to `1`; that is Lambda advice, and here it serialises those queries
  until they hit the 10s pool timeout. Supabase's free pool is ~15 connections, so keep
  the product of instances × limit under that.
- **Copy the host from the dashboard, don't guess it.** The `aws-N-<region>` prefix is
  per-project — this project is `aws-1-ap-south-1`, and `aws-0` returns
  `tenant/user not found`.
- **Use the `pooler.supabase.com` hostnames**, not `db.[REF].supabase.co`. The direct host
  is IPv6-only on the free tier; App Runner egress is IPv4.

`DIRECT_URL` exists because migrations cannot run over the transaction pooler.
`prisma/schema.prisma` wires it through `directUrl`.

### 2.3 Run the first migration

No bastion or VPC needed — Supabase is publicly reachable. Run this from your machine with
both URLs set in `.env`.

This repo has **no `prisma/migrations/`** — it was using `db push` against SQLite — so
generate the baseline and apply it in one step:

```bash
npx prisma migrate dev --name init
```

Commit `prisma/migrations/`. Every later deploy uses:

```bash
npx prisma migrate deploy
```

**Do not use `prisma db push` in production** — it can drop columns without warning.

Supabase pre-creates its own `auth`, `storage`, and `realtime` schemas. Prisma manages
`public` only and leaves those alone. If `migrate dev` ever reports drift, **do not accept
the reset it offers** — inspect first; accepting drops your data.

Seed data (optional — plans, roles, permissions):
```bash
npm run db:seed
```

---

## Part 3 — S3 uploads bucket

```bash
aws s3api create-bucket \
  --bucket motojobs-uploads \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# Resumes are candidate PII — the bucket must never be public.
aws s3api put-public-access-block \
  --bucket motojobs-uploads \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

aws s3api put-bucket-encryption \
  --bucket motojobs-uploads \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api put-bucket-versioning \
  --bucket motojobs-uploads \
  --versioning-configuration Status=Enabled
```

Files are served through `/api/files/[...key]`, which authenticates the caller and then issues a 5-minute signed URL. Access rules implemented in that route: the owner can read their own files, admins can read anything, and a recruiter can read a candidate's resume only once that candidate has applied to one of their jobs.

---

## Part 4 — App Runner

### 4.1 Build pipeline: GitHub Actions → ECR → App Runner

**App Runner's GitHub source cannot build a Dockerfile.** Connecting a repo directly
only offers *managed runtimes* (`NODEJS_22`, `PYTHON_311`, …) — the API's `Runtime`
enum has no `DOCKER` value. Docker images reach App Runner only through **ECR**.

So the pipeline is: GitHub Actions builds the image, pushes it to ECR, then calls
`update-service`. `.github/workflows/deploy.yml` does all three on every push to
`main`. There is no `apprunner.yaml` — that file is only read by GitHub-source
builds, which this service does not use.

Code lives at `github.com/prashantkumarupd2004/motojobs`, branch `main`.
`.gitignore` excludes `.env*`, `prisma/dev.db`, and `public/uploads/`. **Verify
before pushing:**
```bash
git status --short          # no .env / dev.db / uploads listed?
git log --stat -1           # nothing unexpected?
```

Actions authenticates via **GitHub OIDC** — no long-lived AWS keys in repo secrets.
This needs an IAM OIDC provider for `token.actions.githubusercontent.com` plus a role
`motojobs-github-actions`.

**Pin the trust policy on the immutable numeric IDs, not the repo name.** GitHub now
issues *immutable subject claims* for new repositories: the `sub` is
`repo:owner@<ownerId>/repo@<repoId>:ref:refs/heads/main`, not
`repo:owner/repo:ref:refs/heads/main`. A trust policy written the old way fails with
`Not authorized to perform sts:AssumeRoleWithWebIdentity`, and the GitHub Actions log
shows only that generic message — the actual claim is visible in CloudTrail under
`userIdentity.principalId`. This repo's IDs: owner `269799554`, repo `1319340940`.

```json
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:repository_owner_id": "269799554",
    "token.actions.githubusercontent.com:repository_id": "1319340940"
  },
  "StringLike": {
    "token.actions.githubusercontent.com:sub": "repo:*:ref:refs/heads/main"
  }
}
```

The ID conditions are what scope this to your repository; the `sub` wildcard only
restricts the branch. Do not drop the ID conditions and leave the wildcard alone — on
its own it would let any repository on GitHub assume the role.

Migrations are *not* run from the workflow: that would mean putting the Supabase
password into GitHub secrets as well as Secrets Manager, doubling the places it can
leak. Run them from your machine before deploying:

```bash
npx prisma migrate deploy
```

### 4.2 IAM instance role

Create role `motojobs-apprunner-instance`, trusted by `tasks.apprunner.amazonaws.com`, with this inline policy. The app authenticates to S3 through this role — **no access keys in environment variables.** Email does not use IAM at all; Resend authenticates with `RESEND_API_KEY`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UploadsBucket",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::motojobs-uploads/*"
    }
  ]
}
```

### 4.3 Create the service

App Runner Console → *Create service* → **Source: Container registry** → ECR repository `motojobs`, tag pushed by the workflow

- ECR access role: `motojobs-apprunner-ecr-access` (lets App Runner pull the image)
- Instance role: `motojobs-apprunner-instance` (lets the app call S3/Secrets Manager)
- Port: `3000`
- Health check path: `/`
- Deployment trigger: **Manual** — the workflow calls `update-service` itself
- **Networking: leave as Public access (default egress).** Do **not** attach a VPC
  connector. Supabase is a public endpoint, so there is nothing to reach privately —
  and attaching a connector routes all outbound traffic through your VPC route table,
  which silently breaks Resend, S3, and OpenAI until you add a NAT Gateway (~$33/mo).

### 4.4 Environment variables

⚠️ **These live in two places and must be kept in sync.** `apprunner update-service`
*replaces* `SourceConfiguration` rather than merging into it, so the deploy workflow
restates the whole block on every run. If you add a variable in the console but not
in `.github/workflows/deploy.yml`, the next deploy silently deletes it. Add to both.

Plaintext (set directly):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `AWS_REGION` | `ap-south-1` |
| `S3_BUCKET` | `motojobs-uploads` |
| `EMAIL_FROM_ADDRESS` | `noreply@motojobs.in` |
| `EMAIL_FROM_NAME` | `Motojobs.in` |
| `EMAIL_REPLY_TO` | `support@motojobs.in` |
| `CONTACT_INBOX` | `support@motojobs.in` |
| `NEXT_PUBLIC_APP_URL` | `https://motojobs.in` |
| `NEXT_PUBLIC_APP_NAME` | `Motojobs.in` |
| `BILLING_ENABLED` | `false` |

Secrets (reference by **Secrets Manager ARN**, never paste the value):

| Key | Contents |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler string (`:6543`, with `pgbouncer=true`) |
| `DIRECT_URL` | Supabase session pooler string (`:5432`) — used by migrations |
| `JWT_SECRET` | new 64-char random — see below |
| `NEXTAUTH_SECRET` | new 64-char random |
| `OPENAI_API_KEY` | your key |
| `RESEND_API_KEY` | sending key from the Resend dashboard (Part 1.4) |

**Generate fresh secrets for production.** The values in your local `.env` have been on a dev machine and must not be reused:

```bash
openssl rand -base64 48
```

⚠️ Changing `JWT_SECRET` invalidates all existing sessions — fine at launch, but never rotate it casually later.

Also note `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_APP_NAME` are **build-time** values, because Next.js inlines `NEXT_PUBLIC_*` into the client bundle at build. Setting them here only affects the server; the workflow passes them to `docker build` as `--build-arg`. To change either one you must rebuild the image, not just edit the service config.

### 4.5 Custom domain

App Runner → your service → **Custom domains** → add `motojobs.in` and `www.motojobs.in`

Add the CNAME records AWS gives you. Certificates are issued and renewed automatically. Allow up to 48h for full propagation, though it's usually under an hour.

---

## Part 5 — Post-deploy verification

```bash
curl -I https://motojobs.in                       # 200, valid TLS
```

Then walk the real signup flow in a browser:

1. Sign up with a **real** address you control — use a non-Gmail one too (Outlook/Yahoo), since Gmail is lenient with domains it already knows
2. OTP email arrives — check it landed in **inbox, not spam**
3. View original / show headers → confirm `SPF=pass`, `DKIM=pass`, `DMARC=pass`
4. Reply to the OTP email → confirm it reaches the `support@` group
5. Enter the OTP → account verifies
6. Welcome email arrives
7. Upload a resume → confirm the object appears in S3, and that the download URL works and expires
8. Wrong OTP 5× → confirm lockout
9. Forgot-password flow → reset code arrives
10. **Send a normal email from Gmail as yourself** → confirm Workspace still authenticates cleanly after the SPF change

Watch during the first days:
- **Resend dashboard** → Emails/Logs for bounce and complaint rates (keep bounces under 5%, complaints under 0.1%) — providers throttle senders above these
- **App Runner** → application logs for Resend send errors
- **Supabase** → Database → *Roles* / *Reports* for active connections, and *Settings →
  Usage* for the 500 MB and 5 GB egress ceilings

---

## Known gaps

Not blocking launch, but you should know about them:

1. **Rate limiting is in-memory** (`src/lib/rate-limit.ts`). It resets on deploy and each App Runner instance keeps its own counters, so with N instances the effective OTP limit is N× what's configured. Move to ElastiCache Redis when you scale past one instance.

2. **No bounce suppression handling.** Resend records bounces in its own dashboard, but nothing marks the address unusable in your database. If a domain starts hard-bouncing you'll keep retrying it. Worth adding a Resend webhook that flags `isEmailVerified = false` on `email.bounced`.

3. **Old uploads.** Anything currently in `public/uploads/` stays on the dev machine — it is not migrated. If there's real data there, copy it to S3 and rewrite the stored URLs before cutover.

4. **`prisma/dev.db` is now unused.** The SQLite file remains on disk; delete it once you've confirmed Postgres holds everything you need.

5. **The Supabase free tier takes no backups.** This is the real cost of the free plan —
   there is no point-in-time restore and no daily snapshot. `scripts/backup-db.sh` dumps
   to S3; schedule it (EventBridge, or any cron you already run) and **verify a restore
   once** before you trust it. Upgrading to Pro ($25/mo) is what buys managed backups back.

6. **Free projects pause after 7 days of no activity** and must be resumed from the
   dashboard. Harmless once the site has real traffic; a nuisance before launch. The
   backup cron in (5) also counts as activity, so scheduling it fixes this as a side
   effect.
