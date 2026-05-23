# 📋 Tutorial — Odds Engine Pro no Vercel

Tempo estimado: **10 minutos**. Você não precisa saber programar.

---

## O que você vai precisar criar (tudo grátis)

| Conta | Link | Para quê |
|-------|------|----------|
| GitHub | https://github.com | Guardar o código |
| Vercel | https://vercel.com | Hospedar o site |
| The Odds API | https://the-odds-api.com | Buscar as odds reais |

---

## PASSO 1 — Criar conta na The Odds API

1. Acesse **https://the-odds-api.com/**
2. Clique em **"Get API Key"** (canto superior direito)
3. Preencha nome, email e senha → clique em **Create Account**
4. Confirme seu email (verifique a caixa de entrada)
5. Após confirmar, faça login → você verá sua **API Key** na dashboard

> **Copie e guarde essa chave** — você vai precisar dela no Passo 4.
> Plano grátis: 500 requisições/mês (suficiente para uso pessoal diário).

---

## PASSO 2 — Criar conta no GitHub e subir o código

### 2.1 — Criar conta no GitHub
1. Acesse **https://github.com**
2. Clique em **Sign up**
3. Siga os passos (email, senha, verificação)

### 2.2 — Criar um repositório
1. Após fazer login, clique no **"+"** no canto superior direito
2. Clique em **"New repository"**
3. Dê o nome: `odds-engine`
4. Deixe como **Public**
5. Clique em **"Create repository"**

### 2.3 — Subir os arquivos
Na página do repositório vazio que apareceu, clique em **"uploading an existing file"** (link azul no meio da página).

Arraste **todos os arquivos da pasta `odds-engine`** que você baixou:
```
odds-engine/
├── app/
│   ├── api/
│   │   ├── odds/
│   │   │   └── route.js
│   │   └── sports/
│   │       └── route.js
│   ├── layout.js
│   └── page.js
├── .gitignore
├── next.config.js
└── package.json
```

> ⚠️ **Importante:** Não suba o arquivo `.env` (se tiver). O `.gitignore` já protege isso.

Depois de arrastar os arquivos, role até o final da página e clique em **"Commit changes"**.

---

## PASSO 3 — Criar conta no Vercel e conectar ao GitHub

1. Acesse **https://vercel.com**
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"** — isso conecta as duas contas automaticamente
4. Autorize o Vercel a acessar seu GitHub

---

## PASSO 4 — Fazer o deploy do projeto

1. No painel do Vercel, clique em **"Add New Project"**
2. Na lista de repositórios do GitHub, encontre **"odds-engine"**
3. Clique em **"Import"**
4. Na tela de configuração:
   - Framework Preset: **Next.js** (já vai detectar automaticamente)
   - Root Directory: deixe em branco
5. **Antes de clicar em Deploy**, role até a seção **"Environment Variables"**

### Configurar a chave da API (muito importante!)
Na seção **Environment Variables**:
- **Name:** `ODDS_API_KEY`
- **Value:** Cole aqui a chave que você copiou no Passo 1
- Clique em **Add**

6. Agora clique em **"Deploy"**
7. Aguarde ~2 minutos enquanto o Vercel builda o projeto

---

## PASSO 5 — Acessar seu site

Após o deploy terminar, o Vercel vai mostrar uma tela de sucesso com o link do seu site, algo como:
```
https://odds-engine-seuusername.vercel.app
```

Clique no link — seu Odds Engine está no ar! 🎉

---

## Como usar o Odds Engine

1. **Selecione o esporte** nas abas (Brasileirão, Premier League, MLS, etc.)
2. **Escolha o jogo** na lista — as odds carregam automaticamente
3. A **Calculadora Dutching** mostra onde apostar e quanto em cada outcome
4. A **tabela de odds** compara todas as casas — verde = melhor odd, amarelo = segunda melhor
5. Clique no **cabeçalho da coluna** para ordenar por melhor Casa, Empate ou Fora
6. Clique em **↻ Atualizar** para puxar odds frescas

---

## Atualizando o site no futuro

Se quiser mudar algo no código:
1. Edite o arquivo no GitHub (clique no arquivo → ícone de lápis)
2. Clique em **"Commit changes"**
3. O Vercel detecta automaticamente e faz o deploy em ~1 minuto

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| "API key não configurada" | Verifique se adicionou `ODDS_API_KEY` nas Environment Variables do Vercel |
| "Nenhum jogo encontrado" | O esporte pode não ter jogos hoje. Tente outro. |
| Site não abre | Aguarde 2-3 minutos após o deploy terminar |
| Odds não carregam | Verifique seus créditos em the-odds-api.com (500/mês no plano grátis) |

---

## Dica: Ver quantos créditos você usou

Acesse **https://the-odds-api.com/account** após fazer login.
O app também mostra no topo quantas requisições restam.

---

Pronto! Qualquer dúvida é só perguntar. 🚀
