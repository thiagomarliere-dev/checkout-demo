# Yuno Checkout Demo

Demo completa de checkout de pagamento usando o [Yuno Web SDK](https://docs.y.uno).

## Pré-requisitos

- Node.js 18+
- Credenciais da Yuno (Account Code, Public API Key, Private Secret Key)

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

2. Preencha o arquivo `.env` com suas credenciais da Yuno:

```env
ACCOUNT_CODE=sua_account_code
PUBLIC_API_KEY=sua_public_api_key
PRIVATE_SECRET_KEY=sua_private_secret_key
PORT=3000
```

3. No arquivo `index.html`, preencha a constante `PUBLIC_API_KEY` com o mesmo valor:

```js
const PUBLIC_API_KEY = "sua_public_api_key";
```

> Se deixar vazio, um `prompt` no browser vai solicitar a chave na primeira vez que clicar em Pagar.

## Rodando

```bash
node server.js
```

Acesse no navegador: [http://localhost:3000](http://localhost:3000)

## Fluxo de pagamento

```
[Usuário clica em Pagar]
        │
        ▼
POST /api/customer          → cria o customer na Yuno
        │
        ▼
POST /api/checkout-session  → cria a sessão de checkout (retorna checkout_session token)
        │
        ▼
Yuno SDK inicializado       → renderiza o formulário de pagamento no #checkout-container
        │
        ▼
[Usuário preenche dados do cartão e confirma]
        │
        ▼
yunoCreatePayment callback  → recebe o one_time_token do SDK
        │
        ▼
POST /api/payment           → processa o pagamento via API Yuno
        │
        ▼
Exibe mensagem de sucesso ou erro
```

## Estrutura de arquivos

```
checkout-demo/
├── server.js        # Backend Express com as 3 rotas da API
├── index.html       # Frontend com Yuno SDK integrado
├── package.json     # Dependências Node.js
├── .env             # Variáveis de ambiente (não versionar)
├── .env.example     # Template de variáveis
└── README.md
```

## Rotas da API

| Método | Rota                    | Descrição                             |
|--------|-------------------------|---------------------------------------|
| POST   | `/api/customer`         | Cria um customer na Yuno              |
| POST   | `/api/checkout-session` | Cria uma checkout session             |
| POST   | `/api/payment`          | Processa o pagamento com one-time token |

## Testando

Use os dados de cartão de teste fornecidos pela Yuno no painel de sandbox.

- País: `BR`
- Moeda: `BRL`
- Valor padrão: `1000` (R$ 10,00 — valor em centavos conforme API Yuno)

## Dependências

| Pacote       | Uso                              |
|--------------|----------------------------------|
| `express`    | Servidor HTTP                    |
| `cors`       | Permite requisições do frontend  |
| `dotenv`     | Carrega variáveis do `.env`      |
| `node-fetch` | Chamadas HTTP para a API Yuno    |
