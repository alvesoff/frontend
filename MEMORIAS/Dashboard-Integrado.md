# Dashboard Integrado - Documentação Técnica

## Visão Geral
O Dashboard Integrado é um componente central do sistema EducaSmart que fornece análises estatísticas detalhadas sobre o desempenho dos alunos. Ele integra dados de duas APIs diferentes:
1. **API EducaSmart**: Fornece dados de provas, resultados e estatísticas
2. **API Quest**: Fornece banco de questões e metadados relacionados

## Arquitetura
O sistema segue uma arquitetura cliente-servidor, com:
- **Frontend**: Interface web responsiva construída com HTML, CSS e JavaScript puro
- **Backend**: API RESTful construída em Node.js/Express com MongoDB como banco de dados

### Estrutura de Arquivos Principais
- `frontend-main/pages/dashboard-integrado.html`: Interface do Dashboard
- `frontend-main/js/dashboard-integrado.js`: Lógica principal do Dashboard
- `frontend-main/js/dashboard-service.js`: Serviço de integração com as APIs
- `API-EDUCASMART-main/routes/resultados.js`: Rotas para resultados e estatísticas
- `API-EDUCASMART-main/controllers/resultados.js`: Controlador com a lógica das estatísticas

## Fluxo de Dados
1. O frontend solicita dados através do serviço `DashboardService`
2. O serviço realiza requisições paralelas para as duas APIs
3. O backend processa as consultas ao banco de dados e gera estatísticas avançadas
4. O serviço normaliza e integra os dados recebidos antes de disponibilizá-los ao frontend
5. O frontend renderiza os dados em gráficos e tabelas

## Pontos de Integração

### 1. Serviço de Dashboard (`dashboard-service.js`)
Este serviço é responsável por:
- Autenticar o usuário
- Obter dados das APIs
- Normalizar formatos diferentes entre as APIs
- Combinar dados em uma estrutura unificada

Principais métodos:
- `obterDadosDashboard()`: Método principal que coordena todas as requisições
- `obterDadosEducaSmart(headers)`: Obtém provas, resultados e estatísticas básicas
- `obterDadosQuest()`: Obtém questões do banco de questões
- `obterEstatisticasAvancadas(headers, filtros)`: Obtém estatísticas detalhadas com filtros
- `combinarDados(dadosEducaSmart, dadosQuest, estatisticasAvancadas)`: Unifica todos os dados

### 2. Endpoint de Estatísticas Avançadas (Backend)
O endpoint `/api/resultados/estatisticas/avancadas` na API EducaSmart fornece:
- Evolução temporal do desempenho
- Média por conteúdo/tópico
- Média por turma
- Distribuição de notas
- Questões mais difíceis
- Desempenho individual dos alunos

Parâmetros de filtro suportados:
- `disciplina`: Filtra por disciplina específica
- `turma`: Filtra por turma específica
- `periodo`: Filtra por período (semana, mês, trimestre, semestre, ano)

### 3. Normalização de Dados
O serviço de dashboard normaliza os seguintes elementos:
- **Campos com acentos**: `evoluçãoTemporal` → `evolucaoTemporal`
- **Formatos de ID**: Uniformiza `_id` e `id` para garantir compatibilidade
- **Estrutura de objetos aninhados**: Ex: `resultado.aluno.nome` vs `resultado.nomeAluno`
- **Campos opcionais**: Fornece valores padrão para campos que podem estar ausentes
- **Conversão de unidades**: Percentuais para notas de 0-10

## Visualizações de Dados

### Gráficos Principais
1. **Desempenho por Turma**: Exibe notas médias por turma (gráfico de barras)
2. **Questões por Disciplina**: Distribuição de questões por disciplina (gráfico de pizza)
3. **Desempenho por Conteúdo**: Taxa de acerto por tópico/conteúdo (gráfico de barras horizontais)

### Estatísticas Avançadas
1. **Evolução Temporal**: Média de desempenho ao longo do tempo (gráfico de linha)
2. **Distribuição de Notas**: Histograma de notas por faixa (0-2, 2-4, etc.)
3. **Média por Turma**: Comparativo detalhado entre turmas
4. **Taxa de Acerto por Conteúdo**: Identifica áreas fortes e fracas
5. **Questões Mais Difíceis**: Lista questões com menor taxa de acerto
6. **Desempenho Individual**: Dados de cada aluno com evolução própria

## Sistema de Filtros
O dashboard permite filtrar dados por:
- Turma
- Disciplina
- Prova específica
- Período de tempo

Quando aplicados, todos os gráficos e estatísticas são atualizados automaticamente.

## Potenciais Problemas e Soluções

### 1. Incompatibilidade de Formatos de Dados
**Problema**: As APIs retornam dados em formatos ligeiramente diferentes.
**Solução**: O método `combinarDados()` normaliza todos os campos para um formato padrão.

### 2. Campos com Acentuação
**Problema**: O campo `evoluçãoTemporal` tem acento, o que pode causar problemas em alguns navegadores/frameworks.
**Solução**: Normalizado para `evolucaoTemporal` no frontend.

### 3. Dados Ausentes ou Incompletos
**Problema**: Algumas respostas da API podem não conter todos os campos esperados.
**Solução**: Verificações de null/undefined e valores padrão para todos os campos opcionais.

## Conclusão
O Dashboard Integrado fornece uma visão completa do desempenho acadêmico, combinando dados de múltiplas fontes em uma interface unificada. A normalização de dados garante compatibilidade entre diferentes partes do sistema, enquanto os filtros permitem análises específicas conforme necessário. 