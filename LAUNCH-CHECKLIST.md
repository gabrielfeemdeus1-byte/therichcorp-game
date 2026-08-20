# TheRichCorp V3 — Ordem de lançamento

Este checklist é a ordem recomendada para tirar o jogo do teste local e colocar uma primeira versão pública no ar.

## Status atual

- Jogo local V3 pronto para teste.
- Gameplay, HUD, moedas, progressão, mentorias e Rich Coins funcionando.
- Backend de Rich Bucks/PIX já estruturado em `/api`.
- SQL do Supabase já preparado em `supabase/001_rich_bucks_payments.sql`.
- Arquivo `vercel.json` pronto para Functions.
- Variáveis necessárias documentadas em `.env.example`.

## Ordem certa agora

### 1. Publicar primeiro sem pagamento real

Objetivo: colocar o jogo em um link HTTPS público e confirmar que abre fora do seu computador.

Deploy recomendado:

- Vercel

Resultado esperado:

- Um link como `https://therichcorp-v3.vercel.app`.
- Jogo abre no navegador do seu amigo.
- Login visual e save local ainda funcionam.
- Loja Rich Bucks continua bloqueada até conectar Supabase/InfinitePay.

### 2. Criar Supabase

Objetivo: transformar o progresso em progresso por conta real.

No Supabase:

1. Criar projeto.
2. Executar o SQL `supabase/001_rich_bucks_payments.sql`.
3. Ativar autenticação por e-mail/senha.
4. Ativar Google se quiser manter o botão Google.
5. Configurar Site URL e Redirect URLs com o domínio publicado.

Resultado esperado:

- Conta nova começa do zero.
- Conta antiga recupera progresso.
- Rich Bucks e mentorias premium ficam no servidor.

### 3. Conectar variáveis na Vercel

Adicionar em Project Settings → Environment Variables:

```txt
PUBLIC_APP_URL=https://seu-link-da-vercel
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
INFINITEPAY_HANDLE=sua-infinite-tag-sem-$
```

Depois disso, fazer novo deploy.

Teste obrigatório:

- Abrir `https://seu-link-da-vercel/api/public-config`.
- Deve retornar somente `supabaseUrl` e `supabaseAnonKey`.

### 4. Conectar InfinitePay

Objetivo: criar checkout PIX real para pacotes de Rich Bucks.

Na InfinitePay:

1. Habilitar Checkout Integrado.
2. Confirmar a InfiniteTag.
3. Usar o webhook:

```txt
https://seu-link-da-vercel/api/infinitepay-webhook
```

Resultado esperado:

- Jogador escolhe 50, 100, 250 ou 500 Rich Bucks.
- Backend cria checkout.
- Jogador paga via PIX.
- Webhook confirma.
- Rich Bucks caem na conta.

### 5. Testar pagamento pequeno

Antes de divulgar:

1. Criar conta real no jogo.
2. Comprar 50 Rich Bucks.
3. Pagar via PIX.
4. Voltar ao jogo.
5. Conferir se o saldo apareceu.
6. Conferir no Supabase se o pedido foi registrado.
7. Recarregar a página e confirmar que o saldo permanece.

### 6. Testar resgate premium

Depois de Rich Bucks cair na conta:

- Comprar Silver com 600 Rich Bucks quando tiver saldo suficiente.
- Confirmar que Silver libera no perfil.
- Confirmar que Rich Coins não compram Silver/Gold/Diamond.
- Confirmar que Starter continua sendo a única comprável com Rich Coins.

### 7. Mandar para amigos testarem

Enviar o link e pedir para testarem:

- Desktop.
- Celular.
- Conta nova.
- Movimento do player.
- Moedas.
- Farm de Rich Coins.
- Rich Starter.
- Painéis de mentoria.
- Loja Rich Bucks, se o PIX já estiver ativo.

## O que não publicar antes de testar

- Não divulgar compra real sem testar um pagamento pequeno.
- Não expor `SUPABASE_SERVICE_ROLE_KEY` no navegador.
- Não confiar em retorno de checkout como confirmação de pagamento.
- Não liberar Rich Bucks sem webhook/`payment_check`.

## Definição de “pronto para lançar”

O jogo está pronto para lançamento público quando:

- Link HTTPS abre para qualquer pessoa.
- Login real funciona.
- Progresso salva por conta.
- Rich Coins não podem ser forjadas para comprar mentorias premium.
- Rich Bucks só entram após PIX confirmado.
- Silver/Gold/Diamond só liberam por Rich Bucks.
- Starter libera com 5.000 Rich Coins.
- Teste em desktop e mobile foi aprovado.
