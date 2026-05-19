
# 🪙 PiagetCoin — Plataforma Escolar de Recompensas

Site para professores enviarem **PGT (Piagetcoin)** para alunos diretamente na blockchain Ethereum (Sepolia Testnet), sem precisar digitar endereços manualmente.

---

## 🔑 Dados do Token

| Campo | Valor |
|---|---|
| **Token** | Piagetcoin (PGT) |
| **Contrato** | `0x4144fBfa3f247dc18fF7B94e809c4FF42301F162` |
| **Rede** | Ethereum Sepolia Testnet |
| **Chain ID** | 11155111 |
| **Decimais** | 18 |

---

## 🚀 Como instalar e rodar

### 1. Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [MetaMask](https://metamask.io/) instalada no navegador
- Conta no [Supabase](https://supabase.com/) (gratuita)

### 2. Instalar dependências

```bash
cd piagetcoin
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env.local
```

Edite o `.env.local`:

```env
# Supabase — pegue em: app.supabase.com → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# PiagetCoin — já configurado, não precisa alterar
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_TOKEN_CONTRACT=0x4144fBfa3f247dc18fF7B94e809c4FF42301F162
NEXT_PUBLIC_TOKEN_SYMBOL=PGT
NEXT_PUBLIC_TOKEN_DECIMALS=18
```

### 4. Configurar o banco de dados Supabase

1. Acesse [app.supabase.com](https://app.supabase.com/)
2. Crie um novo projeto
3. Vá em **SQL Editor**
4. Cole todo o conteúdo do arquivo `supabase/schema.sql`
5. Clique em **Run**

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📱 Como usar

### Para o Professor / Admin:

1. **Criar conta** em `/register` → selecione "Professor" ou "Administrador"
2. **Conectar MetaMask** — clique em "Conectar MetaMask" no painel
3. A MetaMask deve estar na **rede Sepolia** e ter **PGT na carteira**
4. **Ver lista de alunos** — todos aparecem automaticamente
5. **Enviar PGT** — clique em "Enviar PGT" ao lado do aluno:
   - Selecione a quantidade
   - Informe o motivo (opcional)
   - Clique em "Enviar"
   - **MetaMask abre** para confirmar → confirme
   - PGT chegará na carteira do aluno na blockchain ✅

### Para o Aluno:

1. **Criar conta** em `/register` → selecione "Aluno"
2. **Conectar MetaMask** — clique no botão no dashboard
3. O endereço é **salvo automaticamente** — o professor já pode enviar
4. **Ver saldo** e histórico de recompensas no painel

---

## 🏗️ Estrutura do projeto

```
piagetcoin/
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── layout.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx          ← Login
│   │   └── register/page.tsx       ← Cadastro
│   └── (dashboard)/
│       └── dashboard/
│           ├── page.tsx            ← Redirect por role
│           ├── admin/page.tsx      ← Painel professor/admin
│           └── student/page.tsx    ← Painel aluno
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Client-side
│   │   └── server.ts               ← Server-side
│   └── web3/
│       ├── config.ts               ← Contrato e rede
│       └── metamask.ts             ← connectWallet, sendPGT, getBalance
├── hooks/
│   └── useWallet.ts                ← Hook completo de MetaMask
├── supabase/
│   └── schema.sql                  ← Todas as tabelas + RLS
├── types/
│   └── index.ts                    ← Tipos TypeScript
├── middleware.ts                   ← Proteção de rotas
└── .env.example                    ← Variáveis de ambiente
```

---

## ⚙️ Stack utilizada

- **Next.js 15** — Framework React
- **TypeScript** — Tipagem forte
- **TailwindCSS** — Estilização
- **Framer Motion** — Animações
- **Supabase** — Banco de dados + Autenticação
- **ethers.js v6** — Integração blockchain
- **MetaMask** — Carteira do professor/aluno

---

## 🔒 Segurança

- Nenhuma chave privada é armazenada no servidor
- Todas as transações são assinadas localmente pela MetaMask
- Row Level Security (RLS) ativado no Supabase
- Middleware protege rotas autenticadas
- Apenas admins/professores podem enviar PGT

---

## 🛠️ Problemas comuns

**MetaMask não detectada:**
→ Instale a extensão em [metamask.io](https://metamask.io/) e recarregue

**Rede errada (não é Sepolia):**
→ O site vai automaticamente pedir para trocar para Sepolia

**Saldo insuficiente de PGT:**
→ A carteira do professor precisa ter PGT para distribuir

**Aluno não aparece com carteira conectada:**
→ O aluno precisa entrar no site e clicar em "Conectar MetaMask"

---

## 📞 Suporte

Contrato PGT no Etherscan:
[sepolia.etherscan.io/token/0x4144fBfa3f247dc18fF7B94e809c4FF42301F162](https://sepolia.etherscan.io/token/0x4144fBfa3f247dc18fF7B94e809c4FF42301F162)
