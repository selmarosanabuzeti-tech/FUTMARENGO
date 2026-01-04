
# ⚽ FUT MARENGO - Aplicativo de Vaquinha

Este é o sistema oficial de arrecadação do grupo **FUT MARENGO**. Desenvolvido com React, Tailwind CSS e Supabase.

## 🚀 Como Rodar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz com suas chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```
4. Inicie o projeto:
   ```bash
   npm run dev
   ```

## 🌐 Deploy na Vercel

1. Suba este código para um repositório no seu **GitHub**.
2. No dashboard da **Vercel**, clique em "Add New Project".
3. Importe o repositório do GitHub.
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**.

## 🛡️ Segurança
O painel administrativo é protegido pela senha definida no código (`App.tsx`). Para maior segurança em produção, considere implementar Supabase Auth.
