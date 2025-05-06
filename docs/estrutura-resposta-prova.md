# Estrutura de Resposta da Prova

## Estrutura Atual

Atualmente, o JSON de resposta da prova contém as seguintes informações:

```json
{
  "resultadoId": "string",
  "respostas": [
    {
      "questao": 0,
      "alternativaSelecionada": 0,
      "correta": true,
      "pontuacao": 1
    }
  ]
}
```

## Estrutura Recomendada para Dashboard

Para um dashboard mais completo e análises detalhadas, recomenda-se a seguinte estrutura:

```json
{
  "resultadoId": "string",
  "aluno": {
    "id": "string",
    "nome": "string",
    "turma": "string",
    "email": "string (opcional)"
  },
  "prova": {
    "id": "string",
    "codigo": "string",
    "titulo": "string",
    "professor": {
      "id": "string",
      "nome": "string"
    },
    "disciplina": "string",
    "turmas": ["string"]
  },
  "tempoProva": {
    "inicio": "timestamp",
    "fim": "timestamp",
    "duracao": "number (em minutos)",
    "tempoUtilizado": "number (em minutos)"
  },
  "questoes": [
    {
      "indiceOriginal": "number",
      "indiceApresentado": "number",
      "enunciado": "string",
      "alternativas": [
        {
          "indice": "number",
          "texto": "string",
          "correta": "boolean"
        }
      ],
      "respostaAluno": {
        "alternativaSelecionada": "number",
        "correta": "boolean",
        "pontuacao": "number",
        "tempoResposta": "number (em segundos)"
      },
      "tags": ["string"],
      "dificuldade": "string",
      "area": "string"
    }
  ],
  "resultado": {
    "nota": "number",
    "percentualAcerto": "number",
    "totalQuestoes": "number",
    "questoesRespondidas": "number",
    "questoesCorretas": "number",
    "questoesIncorretas": "number",
    "questoesNaoRespondidas": "number"
  }
}
```

## Benefícios da Nova Estrutura

1. **Análise Temporal**
   - Tempo gasto por questão
   - Padrões de resposta ao longo do tempo
   - Identificação de questões que demandam mais tempo

2. **Análise de Desempenho**
   - Desempenho por área de conhecimento
   - Níveis de dificuldade das questões
   - Padrões de erro e acerto

3. **Análise Comportamental**
   - Ordem de resposta das questões
   - Questões puladas ou revisitadas
   - Tempo médio por tipo de questão

4. **Análise Comparativa**
   - Desempenho por turma
   - Comparação entre diferentes provas
   - Evolução do aluno ao longo do tempo

5. **Metadados Técnicos**
   - Informações sobre o ambiente de realização
   - Dados para auditoria e segurança
   - Localização e dispositivo utilizado

## Recomendações de Implementação

1. **Coleta de Dados**
   - Implementar tracking de tempo por questão
   - Registrar sequência de respostas
   - Coletar informações do dispositivo

2. **Segurança**
   - Não armazenar dados sensíveis
   - Anonimizar informações quando necessário
   - Implementar políticas de retenção de dados

3. **Performance**
   - Otimizar tamanho do JSON
   - Implementar paginação para grandes conjuntos de dados
   - Considerar compressão de dados

4. **Integração**
   - Definir endpoints específicos para o dashboard
   - Implementar cache quando apropriado
   - Considerar websockets para atualizações em tempo real


-----------------------------------------
   # Pergunta
   Será necessário fazer alterações na API para implementar a estrutura de dados mais completa que documentamos?
   Sim, para implementar a estrutura de dados mais completa que documentamos, seria necessário fazer alterações na API para:

1. Expandir o endpoint /api/resultados/finalizar para aceitar o novo formato de JSON com todos os campos adicionais
2. Modificar o modelo de dados no backend para armazenar as novas informações
3. Criar novos endpoints específicos para o dashboard que permitam consultar os dados de forma agregada
4. Implementar lógica adicional para processar os novos campos como tempo por questão, metadados técnicos e estatísticas
A mudança requer um trabalho coordenado entre frontend e backend para garantir que todos os novos dados sejam corretamente coletados, processados e armazenados.