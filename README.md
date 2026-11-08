# RFC Management Hub

[![CI](https://github.com/alesima/rfc-management-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/alesima/rfc-management-hub/actions/workflows/ci.yml)
![PHP](https://img.shields.io/badge/PHP-%5E8.2-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-%5E11-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-default-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

Design docs (RFCs) with discussion, voting, and a team approval workflow. Laravel 11 + Inertia + React 18, SQLite by default, zero paid services to run.

## Features

- **RFC lifecycle** — `draft → review → approved / rejected → archived`, every transition recorded in `rfc_transitions` (who, from → to, when, optional comment).
- **Structured content** — title, summary, plus sections (motivation, proposal, impact analysis, implementation plan…) and Markdown + Mermaid rendering with print mode.
- **Discussion & voting** — comments per RFC, up/down votes with toggle-off.
- **Tags** — free-form tagging (`firstOrCreate`) plus a curated suggestion list.
- **Multi-team** — `teams` + `memberships` with roles `owner / admin / member`, per-team seat limits, invite by email.
- **Permissions** — `RfcPolicy` (author or team admin edits; admin approves) and `TeamPolicy` (admins manage members). The UI only renders actions exposed via `rfc.can.*`.
- **Search & filter** — client-side title search + status filter.

## Quickstart (native, recommended)

No Docker needed. Requires PHP `^8.2` with `pdo_sqlite` and Node 22 (the repo pins versions in `.tool-versions` for `mise`).

```bash
composer install
cp .env.example .env          # already SQLite; just add APP_KEY below
php artisan key:generate
php artisan migrate
npm install
```

Run backend + frontend (two terminals):

```bash
php artisan serve              # http://127.0.0.1:8000
npm run dev                    # Vite HMR on :5173
```

Or serve the production build with a single process:

```bash
npm run build && php artisan serve
```

Seed a login user via registration (`/register`) — the first user gets a personal team automatically.

## Quickstart (Docker)

```bash
make up        # backend :8000, Vite :5173
make migrate
make down
```

> **iptables / DNAT error on `up`?** Some hosts (restricted VPS, WSL1, Docker-in-Docker) lack the kernel NAT modules and port publishing fails with `Unable to enable DNAT rule`. The compose file already works around this with `network_mode: host` (the container binds 8000/5173 directly, no port mapping). If that doesn't suit you, run natively as above — it needs nothing but PHP + Node.

## Routes

| Method | URI | Name | Auth |
|---|---|---|---|
| GET | `/` | `home` | – |
| GET | `/rfcs` | `rfcs.index` | – |
| GET | `/rfcs/create` | `rfcs.create` | verified |
| POST | `/rfcs` | `rfcs.store` | verified |
| GET | `/rfcs/{rfc}` | `rfcs.show` | – |
| GET | `/rfcs/{rfc}/edit` | `rfcs.edit` | verified + author/admin |
| PUT / DELETE | `/rfcs/{rfc}` | `rfcs.update/destroy` | verified + author/admin |
| PATCH | `/rfcs/{rfc}/status` | `rfcs.status.update` | verified + change_status |
| POST | `/rfcs/{rfc}/comments` | `comments.store` | verified |
| POST | `/rfcs/{rfc}/vote` | `rfcs.vote` | verified |
| POST | `/teams/{team}/members` | `teams.members.store` | verified + admin |
| DELETE | `/teams/{team}/members/{user}` | `teams.members.destroy` | verified + admin |

> Route order matters: `/rfcs/create` is declared **before** `/rfcs/{rfc}`, otherwise `create` is swallowed as an id.

## Domain model

```
User 1—N Membership N—1 Team 1—N Rfc
Rfc 1—N Comment / Vote / RfcTransition
Rfc N—N Tag
```

- `rfcs.status`: `draft | review | approved | rejected | archived` (default `draft`).
- Allowed transitions live in `Rfc::TRANSITIONS` (backend) and are mirrored in `StatusTransitions.jsx` (frontend labels only — the server re-validates).
- Editing a non-`draft` RFC sends it back to `draft` with an automatic transition entry and a version bump.
- Vote counts use `withVoteCounts()` (`withCount`) — the old per-row `votes()->count()` N+1 is gone.
- `teams.plan` (`free`/`pro`) and `seats_limit` (default 5) are enforced on invite; Stripe hooks in later.

## Permissions matrix

| Action | Author (member) | Team admin/owner | Other member | Guest |
|---|---|---|---|---|
| Read RFC | ✓ | ✓ | ✓ | ✓ |
| Edit / delete | ✓ | ✓ | ✗ | ✗ |
| `draft ↔ review` | ✓ | ✓ | ✗ | ✗ |
| `approve / reject / archive` | ✗ | ✓ | ✗ | ✗ |
| Invite / remove members | ✗ | ✓ | ✗ | ✗ |

Reads are public by design; to scope reads per team, tighten `RfcPolicy::view()`.

## Testing & CI

```bash
php artisan test   # sqlite :memory:, configured in phpunit.xml
vendor/bin/pint --test   # style check (legacy files excluded from gate)
```

PRs run `.github/workflows/ci.yml` (PHP 8.3 + Node 22): `composer install` → `npm ci` → `npm run build` → `php artisan test`.

> Tests render pages through the built manifest. If you see `Unable to locate file in Vite manifest`, run `npm run build` first — and never commit a stray `public/hot` file (it silently masks this locally).

## Roadmap

- Team switcher with team-scoped URLs (`/t/{team}/rfcs`)
- Server-side search + pagination on the list
- Token-based invites, SSO/SAML, audit export
- Integrations: linked GitHub PR, Slack notifications, Markdown/ADR export
