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
// const API_BASE_URL = 'http://localhost:3000'; // Desenvolvimento
const API_BASE_URL = 'https://api-quest-xf6a.onrender.com'; // Produção
```

**Observação:** A API de questões utiliza uma URL base diferente, configurada em `js/api-config.js` como `QUESTOES_API_URL`.

## Endpoints da API (Questões)

A API de questões pode ser acessada através da URL base configurada em `js/api-config.js` (`QUESTOES_API_URL`).

- **`GET /api/v1/questoes`**: Retorna uma lista de questões. Suporta filtros por query parameters (ex: `disciplina`, `serie`, `conteudo`).
- **`POST /api/v1/questoes`**: Cria uma nova questão.
- **`GET /api/questoes/{id}`**: Retorna os detalhes de uma questão específica.
- **`GET /api/questoes-pessoais`**: Retorna as questões pessoais do professor logado.

*(Nota: Consulte o arquivo `js/api-config.js` e os arquivos que utilizam as funções da API para mais detalhes sobre os parâmetros e corpos de requisição/resposta)*

## Desenvolvimento Local
1. Abra o arquivo `index.html` no navegador
2. Certifique-se que o backend está rodando na porta 3000

## Deploy
1. Atualize a URL da API em `js/api-config.js` para o endereço de produção
2. Faça upload dos arquivos para seu servidor web (Vercel, Netlify, etc)
3. Configure CORS no backend para aceitar requisições do domínio de produção