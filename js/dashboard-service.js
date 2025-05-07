/**
 * Serviço para integração das APIs no Dashboard
 * Este serviço combina dados da API EducaSmart e API Quest
 */

const DashboardService = {
  // Referências às APIs
  educaSmartAPI: API_CONFIG.BASE_URL,
  questoesAPI: API_CONFIG.QUESTOES_API_URL,
  
  /**
   * Obtém dados completos para o dashboard
   * Combina informações de ambas as APIs
   */
  async obterDadosDashboard() {
    try {
      // Verificação de autenticação
      if (!API_CONFIG.isProfessorLoggedIn()) {
        console.warn('Professor não está autenticado');
        return null;
      }
      
      // Obter token de autenticação do usuário logado
      const token = API_CONFIG.getToken();
      const headers = API_CONFIG.getAuthHeaders();
      
      // Buscar dados da API EducaSmart
      const dadosEducaSmart = await this.obterDadosEducaSmart(headers);
      
      // Buscar dados da API Quest
      const dadosQuest = await this.obterDadosQuest();
      
      // Buscar estatísticas avançadas
      const estatisticasAvancadas = await this.obterEstatisticasAvancadas(headers);
      
      // Combinar os dados
      return this.combinarDados(dadosEducaSmart, dadosQuest, estatisticasAvancadas);
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error);
      return null; // Não usar dados simulados em caso de erro
    }
  },
  
  /**
   * Obtém dados da API EducaSmart
   */
  async obterDadosEducaSmart(headers) {
    try {
      // Buscar provas do professor
      const provasResponse = await fetch(`${this.educaSmartAPI}/api/provas`, {
        method: 'GET',
        headers
      });
      
      // Buscar resultados das provas
      const resultadosResponse = await fetch(`${this.educaSmartAPI}/api/resultados`, {
        method: 'GET',
        headers
      });
      
      // Buscar estatísticas gerais
      const estatisticasResponse = await fetch(`${this.educaSmartAPI}/api/resultados/estatisticas`, {
        method: 'GET',
        headers
      });
      
      if (!provasResponse.ok || !resultadosResponse.ok) {
        throw new Error('Falha ao obter dados da API EducaSmart');
      }
      
      const provas = await provasResponse.json();
      const resultados = await resultadosResponse.json();
      const estatisticas = estatisticasResponse.ok ? await estatisticasResponse.json() : {};
      
      return {
        provas: provas.data || [],
        resultados: resultados.data || [],
        estatisticas: estatisticas.data || {}
      };
    } catch (error) {
      console.error('Erro ao obter dados da API EducaSmart:', error);
      return { provas: [], resultados: [], estatisticas: {} };
    }
  },
  
  /**
   * Obtém dados da API Quest
   */
  async obterDadosQuest() {
    try {
      // Buscar questões disponíveis
      const questoesResponse = await fetch(`${this.questoesAPI}/api/v1/questoes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!questoesResponse.ok) {
        throw new Error('Falha ao obter dados da API Quest');
      }
      
      const questoes = await questoesResponse.json();
      
      // Calcular estatísticas por disciplina, ano escolar e nível
      const estatisticasQuest = this.calcularEstatisticasQuest(questoes.data || []);
      
      return {
        questoes: questoes.data || [],
        estatisticas: estatisticasQuest
      };
    } catch (error) {
      console.error('Erro ao obter dados da API Quest:', error);
      return { questoes: [], estatisticas: {} };
    }
  },
  
  /**
   * Obtém estatísticas avançadas da API EducaSmart
   */
  async obterEstatisticasAvancadas(headers, filtros = {}) {
    try {
      // Construir a URL com os filtros
      let url = `${this.educaSmartAPI}/api/resultados/estatisticas/avancadas`;
      
      // Adicionar parâmetros de filtro se existirem
      const params = new URLSearchParams();
      if (filtros.disciplina) params.append('disciplina', filtros.disciplina);
      if (filtros.turma) params.append('turma', filtros.turma);
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      // Buscar estatísticas avançadas
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Falha ao obter estatísticas avançadas da API EducaSmart');
      }
      
      const estatisticas = await response.json();
      
      return estatisticas.data || {};
    } catch (error) {
      console.error('Erro ao obter estatísticas avançadas:', error);
      return {};
    }
  },
  
  /**
   * Calcula estatísticas das questões da API Quest
   */
  calcularEstatisticasQuest(questoes) {
    // Contagem por disciplina
    const porDisciplina = questoes.reduce((acc, questao) => {
      acc[questao.disciplina] = (acc[questao.disciplina] || 0) + 1;
      return acc;
    }, {});
    
    // Contagem por ano escolar
    const porAnoEscolar = questoes.reduce((acc, questao) => {
      acc[questao.anoEscolar] = (acc[questao.anoEscolar] || 0) + 1;
      return acc;
    }, {});
    
    // Contagem por nível de dificuldade
    const porNivelDificuldade = questoes.reduce((acc, questao) => {
      acc[questao.nivelDificuldade] = (acc[questao.nivelDificuldade] || 0) + 1;
      return acc;
    }, {});
    
    return {
      porDisciplina,
      porAnoEscolar,
      porNivelDificuldade
    };
  },
  
  /**
   * Combina dados das duas APIs e estatísticas avançadas
   */
  combinarDados(dadosEducaSmart, dadosQuest, estatisticasAvancadas = {}) {
    // Normalizar os dados de estatísticas avançadas
    const estatisticasNormalizadas = {};
    
    // Corrigir o campo com acento para evitar problemas
    if (estatisticasAvancadas.evoluçãoTemporal) {
      estatisticasNormalizadas.evolucaoTemporal = estatisticasAvancadas.evoluçãoTemporal;
    } else {
      estatisticasNormalizadas.evolucaoTemporal = [];
    }
    
    // Mapear outros campos
    estatisticasNormalizadas.mediaPorConteudo = estatisticasAvancadas.mediaPorConteudo || [];
    estatisticasNormalizadas.mediaPorTurma = estatisticasAvancadas.mediaPorTurma || [];
    estatisticasNormalizadas.distribuicaoNotas = estatisticasAvancadas.distribuicaoNotas || [];
    estatisticasNormalizadas.questoesDificeis = estatisticasAvancadas.questoesDificeis || [];
    estatisticasNormalizadas.desempenhoIndividual = estatisticasAvancadas.desempenhoIndividual || [];
    
    // Mapear questões da API Quest por disciplina para enriquecer os dados das provas
    const questoesPorDisciplina = dadosQuest.questoes.reduce((acc, questao) => {
      if (!acc[questao.disciplina]) {
        acc[questao.disciplina] = [];
      }
      acc[questao.disciplina].push(questao);
      return acc;
    }, {});
    
    // Normalizar dados das provas
    const provasNormalizadas = dadosEducaSmart.provas.map(prova => {
      const questoesDaDisciplina = questoesPorDisciplina[prova.disciplina] || [];
      return {
        id: prova._id || prova.id, // Garantir compatibilidade
        _id: prova._id || prova.id,
        titulo: prova.titulo || "Sem título",
        disciplina: prova.disciplina || "Não especificada",
        turmas: prova.turmas || [],
        turma: Array.isArray(prova.turmas) ? prova.turmas[0] : prova.turma || "Não especificada",
        questoesDisponiveis: questoesDaDisciplina.length,
        questoesAdicionais: questoesDaDisciplina.slice(0, 5), // Primeiras 5 questões como sugestão
        dataInicio: prova.dataInicio,
        dataFim: prova.dataFim,
        questoes: prova.questoes || []
      };
    });
    
    // Transformar formato dos resultados para compatibilidade
    const resultadosNormalizados = dadosEducaSmart.resultados.map(resultado => {
      // Buscar a prova correspondente
      const provaRelacionada = provasNormalizadas.find(p => 
        p.id === (resultado.prova?._id || resultado.prova) || 
        p._id === (resultado.prova?._id || resultado.prova)
      );

      return {
        id: resultado._id || resultado.id,
        _id: resultado._id || resultado.id,
        provaId: resultado.prova?._id || resultado.prova,
        alunoId: resultado.aluno?._id || resultado.aluno,
        alunoNome: resultado.aluno?.nome || resultado.nomeAluno || "Aluno não identificado",
        turma: resultado.aluno?.turma || resultado.turma || "Não especificada",
        nota: resultado.percentualAcerto 
              ? resultado.percentualAcerto / 10 // Convertendo percentual para nota 0-10
              : resultado.pontuacaoTotal || 0,
        dataRealizacao: resultado.dataFim || resultado.dataRealizacao || new Date().toISOString(),
        tempoRealizacao: resultado.tempoGasto 
                       ? `${resultado.tempoGasto} min` 
                       : "Não registrado",
        // Se disponível, formatar as questões para o formato esperado pelo frontend
        questoes: Array.isArray(resultado.respostas) 
          ? resultado.respostas.map((resp, idx) => {
              const questaoIndex = resp.questao;
              const questao = provaRelacionada?.questoes?.[questaoIndex];
              
              return {
                titulo: questao?.enunciado 
                       ? questao.enunciado.substring(0, 50) + '...' 
                       : `Questão ${idx + 1}`,
                acertou: resp.correta || false,
                respostaAluno: `Alternativa ${(resp.alternativaSelecionada + 1) || "?"}`,
                respostaCorreta: questao
                               ? `Alternativa ${(questao.alternativas?.findIndex(a => a.correta) + 1) || "?"}`
                               : "Não disponível"
              };
            })
          : []
      };
    });
    
    // Normalizar dados das questões do banco de questões
    const questoesNormalizadas = dadosQuest.questoes.map(questao => ({
      id: questao._id || questao.id,
      _id: questao._id || questao.id,
      titulo: questao.enunciado?.substring(0, 30) + '...' || questao.titulo || "Sem título",
      disciplina: questao.disciplina || "Não especificada",
      nivelDificuldade: questao.nivelDificuldade || "Médio",
      conteudo: questao.conteudo || questao.topico || "Não especificado",
      alternativas: questao.alternativas || []
    }));
    
    // Retornar os dados normalizados
    return {
      provas: provasNormalizadas,
      resultados: resultadosNormalizados,
      estatisticas: {
        ...dadosEducaSmart.estatisticas,
        questoes: dadosQuest.estatisticas,
        avancadas: estatisticasNormalizadas
      },
      questoes: questoesNormalizadas
    };
  },
  
  /**
   * Método removido: não utilizamos mais dados simulados
   */
};