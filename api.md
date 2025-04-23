### Especificações da API
- **Base URL**: `/api/v1`
- **Formato de resposta**: JSON
- **Métodos suportados**: GET, POST, PUT, DELETE


## Endpoints

A API é organizada em torno de recursos RESTful. Os endpoints aceitam solicitações com corpos formatados em JSON e retornam respostas codificadas em JSON.

### Questões

| Método | Endpoint | Descrição |
|--------|----------|------------|
| GET | `/api/v1/questoes` | Lista todas as questões (com suporte para paginação e filtros) |
| GET | `/api/v1/questoes/:id` | Obtém uma questão específica pelo ID |
| POST | `/api/v1/questoes` | Cria uma nova questão |
| PUT | `/api/v1/questoes/:id` | Atualiza uma questão existente |
| DELETE | `/api/v1/questoes/:id` | Exclui uma questão |

### Exemplo de Questão

```json
{
  "disciplina": "Matemática",
  "anoEscolar": 5,
  "nivelDificuldade": "Médio",
  "titulo": "Multiplicação",
  "enunciado": "Qual é o resultado de 12 x 8?",
  "alternativas": [
    {
      "texto": "96",
      "correta": true
    },
    {
      "texto": "92",
      "correta": false
    },
    {
      "texto": "108",
      "correta": false
    },
    {
      "texto": "86",
      "correta": false
    }
  ],
  "explicacao": "12 x 8 = 96, pois 12 x 8 = (10 x 8) + (2 x 8) = 80 + 16 = 96",
  "tags": ["multiplicação", "números naturais"]
}
```

### Modelo JSON da Questão

O corpo da requisição para criar (`POST`) ou atualizar (`PUT`) uma questão deve seguir o seguinte formato JSON:

```json
{
  "disciplina": "String (Obrigatório, Enum: ['Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Inglês', 'Artes', 'Educação Física', 'Química', 'Física', 'Biologia', 'Sociologia', 'Filosofia', 'Literatura', 'Redação', 'Espanhol', 'Música', 'Teatro', 'Informática', 'Educação Ambiental', 'Ensino Religioso', 'Psicologia', 'Economia'])",
  "anoEscolar": "Number (Obrigatório, Mín: 1, Máx: 9)",
  "nivelDificuldade": "String (Obrigatório, Enum: ['Fácil', 'Médio', 'Difícil'])",
  "titulo": "String (Obrigatório)",
  "enunciado": "String (Obrigatório)",
  "alternativas": [
    {
      "texto": "String (Obrigatório)",
      "correta": "Boolean (Obrigatório)"
    }
  ],
  "explicacao": "String (Obrigatório)",
  "tags": ["String"],
  "imagens": ["String (Opcional, formato base64)"]
}
```

**Notas:**

*   Os campos `_id`, `criadoEm` e `atualizadoEm` são gerenciados automaticamente pelo sistema e incluídos nas respostas GET.
*   Pelo menos uma alternativa deve ter `correta` como `true`.

## Filtros

Ao listar questões, você pode aplicar vários filtros para refinar os resultados.

### Parâmetros de Filtro

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|----------|
| disciplina | string | Filtra por disciplina | `/api/v1/questoes?disciplina=Matemática` |
| anoEscolar | number | Filtra por ano escolar (1-9) | `/api/v1/questoes?anoEscolar=5` |
| nivelDificuldade | string | Filtra por nível de dificuldade | `/api/v1/questoes?nivelDificuldade=Fácil` |
| tags | string | Filtra por tags (separadas por vírgula) | `/api/v1/questoes?tags=multiplicação,divisão` |

### Combinando Filtros

Os filtros podem ser combinados para refinar ainda mais os resultados:

```
/api/v1/questoes?disciplina=Matemática&anoEscolar=5&nivelDificuldade=Médio
```
### Criar uma Nova Questão

```javascript
fetch('/api/v1/questoes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    disciplina: 'Matemática',
    anoEscolar: 5,
    nivelDificuldade: 'Médio',
    titulo: 'Multiplicação',
    enunciado: 'Qual é o resultado de 12 x 8?',
    alternativas: [
      { texto: '96', correta: true },
      { texto: '92', correta: false },
      { texto: '108', correta: false },
      { texto: '86', correta: false }
    ],
    explicacao: '12 x 8 = 96, pois 12 x 8 = (10 x 8) + (2 x 8) = 80 + 16 = 96',
    tags: ['multiplicação', 'números naturais']
  })
});
```

### Listar Questões com Filtros

```javascript
fetch('/api/v1/questoes?disciplina=Matemática&anoEscolar=5&nivelDificuldade=Médio')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Atualizar uma Questão

```javascript
fetch('/api/v1/questoes/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nivelDificuldade: 'Fácil',
    explicacao: 'Nova explicação mais detalhada...'
  })
});
```

# Como Enviar Questões ao Repositório

## Estrutura da Questão

Para enviar uma questão, o frontend deve fazer uma requisição POST para /api/v1/questoes com um objeto JSON contendo:

```json
{
  "disciplina": "[Português/Matemática/Ciências/História/Geografia/Inglês/Artes/Educação Física/Química/Física/Biologia/Sociologia/Filosofia/Literatura/Redação/Espanhol/Música/Teatro/Informática/Educação Ambiental/Ensino Religioso/Psicologia/Economia]",
  "anoEscolar": "[1-9]",
  "nivelDificuldade": "[Fácil/Médio/Difícil]",
  "titulo": "Título da questão",
  "enunciado": "Texto do enunciado",
  "alternativas": [
    {"texto": "Alternativa 1", "correta": false},
    {"texto": "Alternativa 2", "correta": true}
  ],
  "explicacao": "Explicação da resposta correta",
  "tags": ["tag1", "tag2"],
  "imagens": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "data:image/png;base64,iVBORw0KGgoAAAA..."
  ]
}
```

## Observações Importantes
- O campo imagens é opcional e aceita múltiplas imagens em base64
- As disciplinas, níveis de dificuldade e ano escolar devem seguir os valores predefinidos
- Todas as alternativas precisam ter texto e indicador de correta/incorreta
- A API retornará status 201 em caso de sucesso com os dados da questão criada
- Em caso de erro, retornará 400 com detalhes da validação
