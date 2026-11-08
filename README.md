# RFC Management Hub

Propostas de design (RFCs) com discussão, votação e workflow de aprovação por time. Laravel 11 + Inertia + React 18, SQLite por padrão.

## O que faz

- CRUD de RFCs com seções estruturadas (motivação, proposta, impacto, plano de implementação...)
- Comentários, up/down votes, tags
- Workflow por time: `draft → review → approved/rejected → archived`, com trilha auditável (`rfc_transitions`)
- Multi-team: `teams`, `memberships` (owner/admin/member), `RfcPolicy` (autor ou admin edita; admin aprova)
- Frontend sinaliza permissões via `rfc.can.{update,delete,change_status}`

## Rodar

```bash
make up        # docker: backend :8000, vite :5173
make migrate   # php artisan migrate
make test      # php artisan test
```

Local sem docker: `composer install && npm install && php artisan migrate && composer run dev`
(precisa de PHP 8.2+ — o repo pinna 8.3.11 no `.tool-versions`; se o shim do mise tentar compilar, use um PHP já instalado no `PATH`).

## Rotas principais

| Método | URI | Nome |
|---|---|---|
| GET | `/rfcs` | `rfcs.index` |
| GET | `/rfcs/create` | `rfcs.create` |
| POST | `/rfcs` | `rfcs.store` |
| GET | `/rfcs/{rfc}` | `rfcs.show` |
| PUT/DELETE | `/rfcs/{rfc}` | `rfcs.update/destroy` |
| PATCH | `/rfcs/{rfc}/status` | `rfcs.status.update` |
| POST | `/rfcs/{rfc}/comments` | `comments.store` |
| POST | `/rfcs/{rfc}/vote` | `rfcs.vote` |

Detalhe: `/rfcs/create` é declarado **antes** de `/rfcs/{rfc}` — inverter quebra o create (vira `show` com id "create").

## Modelo

`User 1—N Membership N—1 Team`, `Team 1—N Rfc`, `Rfc N—N Tag`, `Rfc 1—N Comment/Vote/RfcTransition`.
RFC carrega contadores via `withVoteCounts()` (evita N+1 do `transform()` antigo).

## Próximos passos

- Team switcher + badges de status no React (passo 4)
- Limite de seats por plano + convite por email (passo 5)
- Leitura ainda é pública; pra fechar por time, endurecer `RfcPolicy::view()`
