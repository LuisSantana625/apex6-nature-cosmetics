# Naturé Cosmetics — Sistema de Gestão de Revendas & CRM

Aplicação web desenvolvida para otimizar a gestão comercial, o controle de estoque, o acompanhamento de pedidos e a fidelização de clientes no segmento de revenda de cosméticos.

---

## Links do Projeto e Infraestrutura

* **Aplicação em Produção (Vercel):** `https://<seu-projeto>.vercel.app` *(substitua pelo link gerado no painel da Vercel)*
* **Projeto Supabase (Dashboard):** `https://supabase.com/dashboard/project/<project-ref>` *(substitua pelo ID do seu projeto)*
* **API Endpoint (Supabase URL):** `https://<project-ref>.supabase.co`
* **Repositório Principal (Base):** https://github.com/keyllacristine/apex6-nature
* **Repositório de Deploy (Fork):** https://github.com/LuisSantana625/apex6-nature-cosmetics

---

## Sobre o Projeto e Objetivos

O **Naturé Cosmetics** nasceu da necessidade de substituir controles manuais e planilhas dispersas por uma plataforma centralizada, intuitiva e segura para revendedoras.

### Objetivos Principais
* **Centralização Operacional:** Reunir cadastros de clientes, catálogo de produtos e histórico de vendas em um único painel.
* **Gestão de Recompras (CRM):** Facilitar a identificação de ciclos de consumo para abordagem ativa de clientes e aumento de recorrência.
* **Segurança e Isolamento de Dados:** Garantir que cada operador acesse exclusivamente sua própria carteira de clientes e pedidos por meio de autenticação e políticas de segurança em nível de linha (RLS).
* **Disponibilidade em Nuvem:** Operar com arquitetura moderna, responsiva e hospedada em nuvem para acesso via desktop ou dispositivos móveis.

---

## Funcionalidades do Sistema

* **Autenticação Segura:** Login com e-mail e senha integrado ao Supabase Auth.
* **Dashboard Analítico:** Visão consolidada de indicadores de vendas, clientes ativos e movimentações recentes.
* **Gestão de Clientes (`customers`):** Cadastro completo, consulta e atualização de dados de contato e histórico de compras.
* **Catálogo de Produtos (`products`):** Controle de itens, preços e disponibilidade para venda.
* **Controle de Pedidos (`orders` e `order_items`):** Registro de vendas vinculadas aos clientes e detalhamento dos itens adquiridos.
* **Acompanhamento de Recompras:** Monitoramento inteligente para incentivar novas vendas recorrentes.

---

## Tecnologias Utilizadas

### Frontend
* **React + TypeScript:** Construção de interfaces reativas com tipagem estática.
* **Vite:** Empacotador (bundler) de alta performance para desenvolvimento e build de produção.
* **Tailwind CSS & Componentes UI (shadcn/ui):** Estilização responsiva, acessível e padronizada.
* **TanStack Router / React Router:** Gerenciamento de rotas client-side (SPA).
* **Vitest:** Framework para testes unitários e de integração.

### Backend, Banco de Dados & Infraestrutura
* **Supabase (PostgreSQL):** Banco de dados relacional hospedado em nuvem.
* **Supabase Auth:** Gerenciamento de usuários, sessões e redirecionamentos seguros.
* **Row Level Security (RLS):** Regras de autorização diretamente no banco de dados vinculadas ao `user_id`.
* **Drizzle ORM (`drizzle.config.ts`):** Mapeamento e configuração de schema relacional.
* **GitHub:** Controle de versão distribuído e colaboração via fork e pull requests.
* **Vercel:** Hospedagem, CI/CD automático a cada commit e configuração de roteamento SPA (`vercel.json`).

---

## Estrutura do Projeto

```text
apex6-nature-cosmetics/
├── public/                 # Arquivos estáticos e assets públicos (logo, ícones, etc.)
├── src/                    # Código-fonte principal da aplicação React + TypeScript
│   ├── components/         # Componentes reutilizáveis de interface
│   ├── pages/              # Telas e módulos (Login, Dashboard, Clientes, Produtos, Pedidos)
│   ├── hooks/              # Hooks customizados e regras de estado
│   ├── integrations/       # Cliente e tipagens de conexão com o Supabase
│   └── lib/                # Utilitários e funções auxiliares
├── supabase/               # Scripts SQL de migração, schema e políticas RLS
├── AGENTS.md               # Diretrizes e contexto para agentes de IA
├── README.md               # Documentação principal e Prompt Log do projeto
├── roadmap.md              # Planejamento e evolução de funcionalidades
├── components.json         # Configuração de componentes UI (shadcn/ui)
├── drizzle.config.ts       # Configuração do Drizzle ORM
├── index.html              # Ponto de entrada HTML da aplicação
├── package.json            # Dependências e scripts do projeto
├── tsconfig.json           # Configurações do compilador TypeScript
├── vercel.json             # Configuração de rewrites para rotas SPA na Vercel
├── vite.config.ts          # Configurações de build do Vite
└── vitest.config.ts        # Configurações de testes automatizados (Vitest)
