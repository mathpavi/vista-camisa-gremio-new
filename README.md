# Vista a Camisa do Grêmio - App com IA

Este aplicativo permite que os usuários enviem uma foto ou usem a câmera para que uma Inteligência Artificial os vista com a camisa do Grêmio. Depois, a imagem pode ser transformada em um vídeo da torcida e até em uma figurinha para WhatsApp.

## Arquitetura de Produção

Para que este aplicativo possa ser publicado na internet de forma segura, ele foi reestruturado como um projeto **Vite** com uma **função de backend** (Backend Proxy).

**Por quê?**
A chave da API do Gemini é um segredo que não deve ser exposto no código do frontend. A solução é ter um backend (neste caso, uma *serverless function* na pasta `/api`) que atua como um intermediário seguro:
1.  O **Frontend** (seu app React) envia a imagem para o seu **Backend** no endpoint `/api/api`.
2.  O **Backend**, que roda em um servidor seguro, recebe a imagem, adiciona a chave secreta da API e faz a chamada para a API do Gemini.
3.  A API do Gemini retorna o resultado para o seu **Backend**.
4.  O **Backend** envia o resultado final de volta para o **Frontend**.

Sua chave de API nunca sai do ambiente seguro do servidor.

## Como Publicar (Deploy)

Recomendamos usar plataformas como **Vercel** ou **Netlify**, que possuem planos gratuitos excelentes para projetos como este.

### Passo a Passo (Exemplo com Vercel)

1.  **Crie um Repositório no GitHub:**
    *   Envie todos os arquivos do projeto para um novo repositório no seu GitHub.

2.  **Crie uma Conta na Vercel:**
    *   Acesse [vercel.com](https://vercel.com/) e crie uma conta, de preferência usando sua conta do GitHub.

3.  **Importe o Projeto:**
    *   No seu dashboard da Vercel, clique em "Add New..." -> "Project".
    *   Importe o repositório que você criou no GitHub.

4.  **Configure o Projeto (MUITO IMPORTANTE):**
    *   A Vercel deve detectar automaticamente que é um projeto **Vite**.
    *   Verifique se as **Build & Development Settings** estão assim:
        *   **FRAMEWORK PRESET:** `Vite`
        *   **BUILD COMMAND:** `npm run build`
        *   **OUTPUT DIRECTORY:** `dist`
        *   **INSTALL COMMAND:** `npm install`
    *   Agora, configure a chave da API. Vá para a aba **Settings -> Environment Variables**.
    *   Adicione uma nova variável de ambiente:
        *   **Name:** `API_KEY`
        *   **Value:** `SUA_CHAVE_SECRETA_DA_API_DO_GEMINI` (cole sua chave aqui)
    *   Certifique-se de que a variável **NÃO** esteja marcada como "Exposed to the browser". Ela deve estar disponível apenas no ambiente do servidor (Serverless Functions).

5.  **Faça o Deploy:**
    *   Clique no botão "Deploy". A Vercel irá instalar as dependências, construir seu projeto e publicar tanto o frontend (da pasta `dist`) quanto a função que está no diretório `/api`.

6.  **Pronto!**
    *   Após alguns minutos, seu site estará no ar em um domínio público fornecido pela Vercel.

### Estrutura de Arquivos Final

Sua estrutura de arquivos deve ser semelhante a esta:

```
/
├── api/
│   └── api.ts       <-- Sua função de backend segura
├── public/
│   └── hino.mp3
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── services/
│   │   └── geminiService.ts
│   └── utils/
│       └── tracking.ts
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Seguindo esses passos, você terá uma aplicação pública, rápida, escalável e, o mais importante, **segura**.
