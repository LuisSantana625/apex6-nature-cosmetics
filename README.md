# Naturê Cosméticos — Vite + React

Versão do painel de gerenciamento de pedidos, produtos, clientes e alertas de recompra portada do Lovable para Vite + React. O roteamento continua usando TanStack Router; a aplicação roda no navegador e acessa o Supabase com as políticas RLS existentes.

## Desenvolvimento

Requer Node.js 20.19+ ou 22.12+ e npm.

```sh
npm install
npm run dev
```

Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente local para conectar ao Supabase. Não use chaves de service role no navegador.

## Validação

```sh
npm run build
npm run typecheck
npm test
npm run lint
```
