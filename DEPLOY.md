# 🚀 GUIA DE DEPLOY - MEDIA AGENCY SAAS

## Pré-requisitos Concluídos ✅
- [x] Projeto Next.js funcionando
- [x] Supabase configurado
- [x] Schema do banco de dados pronto

---

## PASSO 1: Executar Migração no Supabase 🗄️

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `tfbqosujxgjhrfywfugr`
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo `supabase/migration-multitenant.sql`
6. Cole no editor e clique **Run**
7. Verifique se aparece "Success. No rows returned"

### Verificar se funcionou:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
Deve mostrar: agencies, profiles, clients, posts, activity_log, notifications, invitations

---

## PASSO 2: Configurar Stripe 💳

### 2.1 Criar conta Stripe
1. Acesse https://stripe.com e crie uma conta
2. Complete a verificação da empresa

### 2.2 Criar Produtos
No Dashboard Stripe → Products → Add Product:

**Produto 1 - Starter**
- Nome: Starter
- Preço: R$ 197,00/mês (recurring)
- Copie o Price ID (price_xxx)

**Produto 2 - Professional**
- Nome: Professional  
- Preço: R$ 497,00/mês (recurring)
- Copie o Price ID (price_xxx)

**Produto 3 - Enterprise**
- Nome: Enterprise
- Preço: R$ 997,00/mês (recurring)
- Copie o Price ID (price_xxx)

### 2.3 Obter Chaves
Dashboard Stripe → Developers → API Keys:
- Publishable key: pk_live_xxx
- Secret key: sk_live_xxx

### 2.4 Configurar Webhook
Dashboard Stripe → Developers → Webhooks → Add Endpoint:
- URL: https://www.mediamars.com.br/api/stripe/webhook
- Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
- Copie o Signing Secret: whsec_xxx

---

## PASSO 3: Deploy na Vercel 🌐

### 3.1 Preparar Repositório
```bash
cd "D:\projeto agencia de midia SAAS\frontend"
git add .
git commit -m "Prepare for production"
git push origin main
```

### 3.2 Criar Projeto na Vercel
1. Acesse https://vercel.com
2. Clique "Add New" → "Project"
3. Importe o repositório: marsdsf/media-agency-saas
4. Framework: Next.js (detectado automaticamente)

### 3.3 Configurar Variáveis de Ambiente
Na Vercel, adicione estas variáveis (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://tfbqosujxgjhrfywfugr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PROFESSIONAL=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx

OPENAI_API_KEY=sk-proj-xxx

NEXT_PUBLIC_APP_URL=https://www.mediamars.com.br
```

### 3.4 Deploy
Clique "Deploy" e aguarde ~2 minutos

---

## PASSO 4: Configurar Domínio 🌍

### 4.1 Comprar Domínio
Opções recomendadas:
- https://registro.br (domínios .com.br)
- https://namecheap.com (domínios internacionais)
- https://cloudflare.com/products/registrar/

### 4.2 Configurar na Vercel
1. Vercel → Seu Projeto → Settings → Domains
2. Adicione seu domínio: mediamars.com.br e www.mediamars.com.br
3. Configure os DNS conforme instruções da Vercel:
   - Tipo A: 76.76.19.19
   - Tipo CNAME: cname.vercel-dns.com

### 4.3 SSL (Automático)
A Vercel gera certificado SSL automaticamente após DNS propagar.

---

## PASSO 5: Configurações Finais ⚙️

### 5.1 Atualizar URL do Stripe Webhook
Após ter o domínio, atualize o webhook no Stripe:
- https://seu-dominio.com/api/webhooks/stripe

### 5.2 Configurar Supabase URL Redirect
Supabase Dashboard → Authentication → URL Configuration:
- Site URL: https://www.mediamars.com.br
- Redirect URLs: https://www.mediamars.com.br/**

### 5.3 Testar Fluxo Completo
1. ✅ Registro de nova agência
2. ✅ Login
3. ✅ Criar cliente
4. ✅ Criar post
5. ✅ Gerar conteúdo com IA
6. ✅ Pagamento (usar modo teste primeiro)

---

## PASSO 6: Modo Produção Stripe 💰

Quando estiver pronto para receber pagamentos reais:

1. Stripe Dashboard → Ativar modo Live
2. Complete verificação da empresa
3. Substitua chaves de teste por chaves Live no Vercel
4. Redeploy

---

## Checklist Final ✅

- [ ] SQL executado no Supabase
- [ ] Stripe configurado com produtos
- [ ] Deploy feito na Vercel
- [ ] Domínio configurado
- [ ] SSL ativo (HTTPS)
- [ ] Webhook Stripe apontando para domínio
- [ ] Supabase URLs atualizadas
- [ ] Teste de registro funcionando
- [ ] Teste de login funcionando
- [ ] Teste de pagamento funcionando

---

## Suporte 🆘

Se encontrar erros:
1. Verifique logs: Vercel → Seu Projeto → Deployments → Logs
2. Console do navegador (F12)
3. Supabase → Logs

## Custos Estimados 💵

- **Vercel**: Grátis (Hobby) ou $20/mês (Pro)
- **Supabase**: Grátis até 500MB ou $25/mês (Pro)
- **Stripe**: 2.9% + R$0.50 por transação
- **Domínio .com.br**: ~R$40/ano
- **OpenAI**: ~$0.002 por 1K tokens

---

Boa sorte! 🎉
