# =============================================
# GUIA DE CONFIGURAÇÃO - AGÊNCIA DE MÍDIA SAAS
# =============================================

## 1. SUPABASE (Banco de Dados e Autenticação)

### Passo 1: Criar conta e projeto
1. Acesse https://supabase.com
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Escolha um nome e senha para o banco

### Passo 2: Configurar banco de dados
1. Vá em "SQL Editor"
2. Cole o conteúdo do arquivo `supabase/schema.sql`
3. Execute o SQL

### Passo 3: Obter credenciais
1. Vá em "Settings" > "API"
2. Copie:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Passo 4: Configurar autenticação
1. Vá em "Authentication" > "Providers"
2. Habilite "Email" (já vem habilitado)
3. Configure templates de email (opcional)

---

## 2. STRIPE (Pagamentos)

### Passo 1: Criar conta
1. Acesse https://stripe.com
2. Crie uma conta

### Passo 2: Criar produtos e preços
1. Vá em "Products" > "Add Product"
2. Crie 3 produtos:
   - **Starter** - R$ 97/mês
   - **Professional** - R$ 197/mês
   - **Enterprise** - R$ 497/mês

### Passo 3: Obter credenciais
1. Vá em "Developers" > "API keys"
2. Copie:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### Passo 4: Configurar Webhook
1. Vá em "Developers" > "Webhooks"
2. Clique em "Add endpoint"
3. URL: `https://www.mediamars.com.br/api/stripe/webhook`
4. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie Webhook secret → `STRIPE_WEBHOOK_SECRET`

### Passo 5: Copiar IDs dos preços
1. Em cada produto, copie o "Price ID" (começa com `price_`)
2. Cole em:
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_PROFESSIONAL`
   - `STRIPE_PRICE_ENTERPRISE`

---

## 3. OPENAI (Inteligência Artificial)

### Passo 1: Criar conta
1. Acesse https://platform.openai.com
2. Crie uma conta

### Passo 2: Obter API Key
1. Vá em "API Keys"
2. Clique em "Create new secret key"
3. Copie → `OPENAI_API_KEY`

### Passo 3: Adicionar créditos
1. Vá em "Billing"
2. Adicione um método de pagamento
3. Compre créditos (mínimo $5)

---

## 4. META (Instagram/Facebook)

### Passo 1: Criar conta de desenvolvedor
1. Acesse https://developers.facebook.com
2. Crie uma conta de desenvolvedor

### Passo 2: Criar App
1. Clique em "Create App"
2. Escolha "Business"
3. Preencha nome e email

### Passo 3: Configurar produtos
1. Adicione "Facebook Login"
2. Adicione "Instagram Graph API"

### Passo 4: Obter credenciais
1. Em "Settings" > "Basic":
   - App ID → `META_APP_ID`
   - App Secret → `META_APP_SECRET`

### Passo 5: Configurar OAuth
1. Em "Facebook Login" > "Settings"
2. Adicione Redirect URI:
   `https://www.mediamars.com.br/api/social/instagram/callback`

### Passo 6: Solicitar permissões (para produção)
1. Em "App Review" > "Permissions and Features"
2. Solicite:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_comments`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`

---

## 5. VARIÁVEIS DE AMBIENTE

Atualize o arquivo `.env.local` com todas as credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# Meta
META_APP_ID=123456789...
META_APP_SECRET=abc123...

# App
NEXT_PUBLIC_APP_URL=https://www.mediamars.com.br
```

---

## 6. DEPLOY

### Vercel (Recomendado)
1. Conecte seu repositório GitHub
2. Adicione variáveis de ambiente
3. Deploy!

### Railway
1. Crie projeto
2. Conecte GitHub
3. Adicione variáveis
4. Deploy!

---

## 7. CUSTOS ESTIMADOS

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Free | $0/mês |
| Stripe | Pay as you go | 3.4% + R$0.40/transação |
| OpenAI | Pay as you go | ~$0.002/1K tokens |
| Vercel | Hobby | $0/mês |

**Total para começar: $0/mês** (só paga quando tiver clientes)

---

## 8. PRÓXIMOS PASSOS

1. [ ] Configurar Supabase
2. [ ] Configurar Stripe
3. [ ] Configurar OpenAI
4. [ ] Configurar Meta Developer
5. [ ] Testar fluxo de cadastro
6. [ ] Testar fluxo de pagamento
7. [ ] Testar conexão Instagram
8. [ ] Deploy em produção
