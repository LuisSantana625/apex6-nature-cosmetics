# Naturé Cosmetics — Prompt Log & Documentação de Execução

Registro consolidado das ações, decisões técnicas, configurações de ambiente, migração de dados e validações realizadas durante o desenvolvimento e publicação do MVP **Naturé Cosmetics** (`apex6-nature`).

---

## Links do Projeto e Infraestrutura

* **Aplicação em Produção (Vercel):** `https://<seu-projeto>.vercel.app` *(substitua pelo link gerado no painel da Vercel)*
* **Projeto Supabase (Dashboard):** `https://supabase.com/dashboard/project/<project-ref>` *(substitua pelo ID do seu projeto)*
* **API Endpoint (Supabase URL):** `https://<project-ref>.supabase.co`
* **Repositório Principal (Base):** https://github.com/keyllacristine/apex6-nature
* **Repositório de Deploy (Fork):** https://github.com/LuisSantana625/apex6-nature

---

## Equipe e Responsabilidades

| Integrante | Função | Principais Entregas |
| :--- | :--- | :--- |
| **Luis Felipe** | Tech Lead & Product Owner (PO) | Fork e versionamento no GitHub, deploy na Vercel, configuração do `vercel.json`, provisionamento e migração do Supabase, variáveis de ambiente e sincronização do repositório |
| **Keylla Cristine** | UX/UI Designer & AI Builder | Geração inicial do MVP no Lovable Cloud, design da interface, estruturação do repositório base e evolução visual do sistema |
| **Samira Borges** | QA & Privacidade | Validação de autenticação e URLs de redirecionamento, revisão de privacidade/RLS e vínculo de dados por usuário, testes funcionais (CRUD) e checagem de rotas |

---

## Prompt Log por Integrante

### 1. Luis Felipe — Tech Lead & Product Owner (PO)

1. **Gestão de Repositório e Fork**
   * **Contexto / Prompt:** Resolução de bloqueio de permissão ao tentar publicar pela Vercel apontando para o repositório original (`keyllacristine/apex6-nature`), seguido da criação do fork `LuisSantana625/apex6-nature` na branch `main`.
   * **Resultado:** Repositório acessível na conta própria com histórico e arquivos sincronizados na `main`.

2. **Deploy do Zero na Vercel**
   * **Contexto / Prompt:** Criação de novo projeto na Vercel a partir do fork com preset **Vite**.
   * **Resultado:** Pipeline de build configurado e primeiro deploy publicado no domínio `.vercel.app`.

3. **Suporte a Rotas SPA (`vercel.json`)**
   * **Contexto / Prompt:** Prevenção de erro `404` ao atualizar (`F5`) rotas internas gerenciadas por `@tanstack/react-router`.
   * **Resultado:** Arquivo `vercel.json` adicionado na raiz redirecionando rotas para `/index.html`.

4. **Provisionamento do Supabase e Schema**
   * **Contexto / Prompt:** Criação de projeto próprio no Supabase, coleta da **Project URL** e **Publishable Key** e execução dos 3 arquivos `.sql` no **SQL Editor**.
   * **Resultado:** Estrutura de tabelas e políticas recriada no novo banco PostgreSQL.

5. **Configuração de Variáveis na Vercel**
   * **Contexto / Prompt:** Ajuste das variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no modo **Config** para os ambientes **Production** e **Preview**, corrigindo o erro `Invalid path specified in request URL` após garantir a URL raiz `.supabase.co`.
   * **Resultado:** Build recompilado com sucesso apontando para a nova instância do Supabase.

6. **Migração e Vínculo de Dados (`user_id`)**
   * **Contexto / Prompt:** Consulta ao `information_schema.columns` e execução de comandos `UPDATE` nas tabelas `customers`, `orders`, `products` e `order_items` para associar os registros importados ao `User UID` criado no novo Supabase.
   * **Resultado:** Dados históricos visíveis e operacionais no painel da aplicação.

7. **Governança entre Fork e Repositório Principal**
   * **Contexto / Prompt:** Definição do fluxo de **Pull Request** (`LuisSantana625/apex6-nature` -> `keyllacristine/apex6-nature`) e decisão de manter o deploy ativo a partir do fork para autonomia operacional.
   * **Resultado:** Fluxo de colaboração documentado sem risco ao ambiente de produção.

---

### 2. Keylla Cristine — UX/UI Designer & AI Builder

1. **Prototipação e Geração do MVP**
   * **Contexto / Prompt:** Construção do sistema de gerenciamento de revendas de cosméticos no Lovable Cloud (`apex6-nature`).
   * **Resultado:** Módulos de autenticação, clientes, produtos, pedidos e acompanhamento de recompras estruturados em React + Vite.

2. **Refinamento Visual e UX/UI**
   * **Contexto / Prompt:** Atualizações de layout e identidade visual (*"Atualiza projeto Nature Cosmetics com novo design"*).
   * **Resultado:** Interface padronizada e navegação intuitiva entre as áreas operacionais.

3. **Organização do Código Fonte**
   * **Contexto / Prompt:** Manutenção do repositório base `keyllacristine/apex6-nature` com as pastas `src/`, `public/`, `supabase/` e `drizzle/`.
   * **Resultado:** Base de código versionada e compartilhada com a equipe.

---

### 3. Samira Borges — QA & Privacidade

1. **Validação de Autenticação e Sessão**
   * **Contexto / Prompt:** Verificação de criação de usuário em **Authentication -> Users**, confirmação de credenciais e configuração de **Site URL** / **Redirect URLs** no Supabase.
   * **Resultado:** Login funcional no ambiente publicado na Vercel.

2. **Privacidade, Isolamento e RLS**
   * **Contexto / Prompt:** Conferência de políticas de segurança (**RLS**) e associação da coluna `user_id` aos registros de `customers`, `orders`, `products` e `order_items`.
   * **Resultado:** Dados isolados por usuário autenticado sem exposição indevida.

3. **Segurança de Credenciais**
   * **Contexto / Prompt:** Separação entre chave pública (`sb_publishable_...` em `VITE_SUPABASE_PUBLISHABLE_KEY`) e chave secreta (`Secret key`).
   * **Resultado:** Nenhuma chave privilegiada de backend exposta no código cliente.

4. **Testes Funcionais e de Regressão (QA)**
   * **Contexto / Prompt:** Conferência de leitura dos dados migrados, testes de criação/edição/exclusão (CRUD) e atualização de página (`F5`) em rotas internas.
   * **Resultado:** Fluxos principais validados após a migração de banco e deploy.

---

## Variáveis de Ambiente Necessárias (Vercel)

* `VITE_SUPABASE_URL`: URL base do projeto Supabase (`https://<project-ref>.supabase.co`)
* `VITE_SUPABASE_PUBLISHABLE_KEY`: Chave pública do projeto Supabase (`sb_publishable_...`)
