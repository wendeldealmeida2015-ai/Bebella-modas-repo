# Bebella Modas - Backend (Mercado Pago)

Este repositório contém o backend em **Node.js + Express** para integrar o app Bebella Modas ao **Mercado Pago** (Pix + Cartão).

## O que já inclui
- Rota `/create_payment` para criar preference (Checkout Pro) e retornar `init_point`.
- Rota `/mp_webhook` para receber notificações do Mercado Pago.
- Rota `/payment/:id` para consultar pagamento manualmente.
- Exemplo de `.env` e instruções de deploy.

## Imagem de referência (sua tela do Railway)
A imagem que você enviou está disponível localmente no ambiente de chat neste caminho (vou incluir aqui para referência):
`/mnt/data/Screenshot_2025-11-22-11-54-42-534_com.android.chrome.jpg`

## Como usar (local)
1. Copie `.env.example` para `.env` e preencha `MP_ACCESS_TOKEN` e `BACKEND_URL`.
2. Instale dependências:
   ```bash
   npm install
   ```
3. Rode em dev:
   ```bash
   npm run dev
   ```

## Deploy no Railway (passos rápidos)
1. Faça login em https://railway.app e clique em **New Project** → **Deploy from GitHub Repo**.
2. Crie um repo no GitHub com o conteúdo deste código (ou use o botão **Import from GitHub** se preferir).
3. No Railway, conecte o repositório (Grant access ao GitHub se necessário).
4. Na aba **Settings** do projeto Railway, adicione as variáveis de ambiente do `.env`.
   - `MP_ACCESS_TOKEN`
   - `BACKEND_URL`
   - `MP_BACKURL_SUCCESS`, `MP_BACKURL_FAILURE`, `MP_BACKURL_PENDING`
5. Deploy e copie a URL pública. Coloque essa URL em `BACKEND_URL` e em `notification_url` (o código já usa `BACKEND_URL`).
6. Teste criando pagamento a partir do app — o app chama `/create_payment` e abre o `init_point`.

## Notas de segurança
- NUNCA coloque o `MP_ACCESS_TOKEN` no app — mantenha-o no backend.
- Use HTTPS em produção.

