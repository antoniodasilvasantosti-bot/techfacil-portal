# 🚀 Guia de Deploy - TechFácil

## Deploy no Vercel (Recomendado)

### Passo 1: Preparar localmente
```bash
# Clone o repositório
git clone https://github.com/antoniodasilvasantosti-bot/techfacil-portal.git
cd techfacil-portal

# Instale as dependências
npm install

# Teste localmente
npm start
```

### Passo 2: Deploy Automático via Vercel

**Opção A: Via Dashboard (Mais Fácil)**
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Selecione **"Import Git Repository"**
4. Coloque a URL: `https://github.com/antoniodasilvasantosti-bot/techfacil-portal`
5. Clique em **"Import"** e depois **"Deploy"**
6. Pronto! 🎉 Seu site estará em `https://techfacil-portal.vercel.app`

**Opção B: Via CLI**
```bash
# Instale a CLI do Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel --prod
```

### Passo 3: Usar domínio customizado (opcional)
No dashboard do Vercel:
1. Vá até **Settings** → **Domains**
2. Adicione seu domínio (ex: techfacil.com)
3. Configure os DNS records conforme instruído

---

## Deploy no GitHub Pages

Se preferir usar GitHub Pages:

```bash
# Adicione ao package.json:
npm install --save-dev gh-pages

# Build
npm run build

# Deploy
npx gh-pages -d build
```

Seu site estará em: `https://antoniodasilvasantosti-bot.github.io/techfacil-portal/`

---

## Variáveis de Ambiente (se necessário)

Crie um arquivo `.env` na raiz do projeto:
```
REACT_APP_API_URL=https://sua-api.com
REACT_APP_BASE44_KEY=sua-chave-aqui
```

No Vercel, adicione no Dashboard:
- Settings → Environment Variables

---

## ✅ Checklist

- [ ] `npm install` executado com sucesso
- [ ] `npm start` funciona localmente
- [ ] Repositório está no GitHub
- [ ] Conta Vercel criada e conectada ao GitHub
- [ ] Deploy realizado com sucesso

---

Qualquer dúvida, consulte a [documentação oficial do Vercel](https://vercel.com/docs).
