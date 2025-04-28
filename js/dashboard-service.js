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
      
      // Combinar os dados
      return this.combinarDados(dadosEducaSmart, dadosQuest);
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
   * Combina dados das duas APIs
   */
  combinarDados(dadosEducaSmart, dadosQuest) {
    // Mapear questões da API Quest por disciplina para enriquecer os dados das provas
    const questoesPorDisciplina = dadosQuest.questoes.reduce((acc, questao) => {
      if (!acc[questao.disciplina]) {
        acc[questao.disciplina] = [];
      }
      acc[questao.disciplina].push(questao);
      return acc;
    }, {});
    
    // Enriquecer os dados das provas com informações adicionais das questões
    const provasEnriquecidas = dadosEducaSmart.provas.map(prova => {
      const questoesDaDisciplina = questoesPorDisciplina[prova.disciplina] || [];
      return {
        ...prova,
        questoesDisponiveis: questoesDaDisciplina.length,
        questoesAdicionais: questoesDaDisciplina.slice(0, 5) // Primeiras 5 questões como sugestão
      };
    });
    
    // Calcular estatísticas combinadas
    const estatisticasCombinadas = {
      // Estatísticas da API EducaSmart
      ...dadosEducaSmart.estatisticas,
      
      // Estatísticas da API Quest
      questoes: dadosQuest.estatisticas
    };
    
    return {
      provas: provasEnriquecidas,
      resultados: dadosEducaSmart.resultados,
      estatisticas: estatisticasCombinadas,
      questoes: dadosQuest.questoes
    };
  },
  
  /**
   * Método removido: não utilizamos mais dados simulados
   */
};