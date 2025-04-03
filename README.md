# Frontend do Sistema de Criação de Provas

## Estrutura de Diretórios
```
frontend/
├── css/           # Estilos da aplicação
├── js/            # Scripts JavaScript
├── img/           # Imagens e assets
├── pages/         # Páginas HTML
└── index.html     # Página inicial
```

## Configuração do Ambiente
1. Configurar variáveis de ambiente no arquivo `js/api-config.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000'; // Desenvolvimento
// const API_BASE_URL = 'https://seu-backend.com'; // Produção
```

## Desenvolvimento Local
1. Abra o arquivo `index.html` no navegador
2. Certifique-se que o backend está rodando na porta 3000

## Deploy
1. Atualize a URL da API em `js/api-config.js` para o endereço de produção
2. Faça upload dos arquivos para seu servidor web (Vercel, Netlify, etc)
3. Configure CORS no backend para aceitar requisições do domínio de produção