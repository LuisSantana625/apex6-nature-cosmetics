# Rotas

A aplicação usa TanStack Router com roteamento baseado em arquivos, gerado pelo plugin do Vite. Cada arquivo `.tsx` nesta pasta define uma rota. A rota raiz e o layout global ficam em `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | rota de layout (renderiza as filhas com `<Outlet />`) |
| `__root.tsx` | rota raiz — envolve as páginas; preserve `<Outlet />` |

`src/routeTree.gen.ts` é gerado automaticamente. Não edite esse arquivo manualmente.
