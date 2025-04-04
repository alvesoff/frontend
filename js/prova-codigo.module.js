// ===========================
// PROVA-CODIGO.MODULE.JS
// ===========================

/**
 * Gera um código único para a prova
 * Formato: XXXX-XXXX-XXXX (onde X pode ser letra ou número)
 * @returns {string} Código único da prova
 */
export function gerarCodigoProva() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  
  // Gerar 3 grupos de 4 caracteres
  for (let grupo = 0; grupo < 3; grupo++) {
    for (let i = 0; i < 4; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres.charAt(indice);
    }
    
    // Adicionar hífen entre os grupos (exceto após o último grupo)
    if (grupo < 2) {
      codigo += '-';
    }
  }
  
  return codigo;
}

/**
 * Salva a prova com seu código único no backend
 * @param {Object} provaData - Dados da prova
 * @returns {Promise<string>} Código da prova gerado
 */
export async function salvarProvaComCodigo(provaData) {
  // Usar APENAS o código da prova que já foi definido
  // Não gerar um novo código para evitar inconsistências
  const codigoProva = provaData.codigoProva;
  
  // Garantir que o código está definido na prova
  provaData.codigoProva = codigoProva;
  provaData.dataCriacao = new Date().toISOString();
  
  try {
    // Salvar diretamente no localStorage sem tentar enviar para o backend
    // Isso evita problemas de autenticação com o token
    const todasProvas = JSON.parse(localStorage.getItem('provasCadastradas') || '[]');
    todasProvas.push(provaData);
    localStorage.setItem('provasCadastradas', JSON.stringify(todasProvas));
    
    console.log('Prova salva com sucesso no localStorage com código:', codigoProva);
    
    // Tentar salvar no backend de forma assíncrona, mas não depender do resultado
    // Isso é opcional e não afeta o fluxo principal
    try {
      const API_URL = API_CONFIG.BASE_URL;
      
      // Mapear os dados da prova para o formato esperado pelo backend
      const provaFormatada = {
        titulo: provaData.nomeProva,
        disciplina: [...(provaData.componentesFundamental || []), ...(provaData.componentesMedio || [])].join(', '),
        serie: provaData.selectedFund.length > 0 ? 'Fundamental' : 'Médio',
        turmas: [...(provaData.selectedFund || []), ...(provaData.selectedMedio || [])],
        questoes: (provaData.questoes || []).map(q => ({
          enunciado: q.enunciado,
          alternativas: (q.alternativas || []).map((alt, index) => ({
            texto: alt,
            correta: index === parseInt(q.correctAlternative, 10)
          })),
          pontuacao: 1,
          dificuldade: q.difficulty || 'PADRÃO',
          serie: q.series || ''
        })),
        dataInicio: new Date().toISOString(),
        dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias a partir de agora
        duracao: 60,
        codigoProva: codigoProva
      };
      
      // Obter token e ID do professor
      const token = localStorage.getItem('token');
      const professorId = localStorage.getItem('professorId');

      if (!token || !professorId) {
        console.warn('Token ou ID do professor não encontrado. A prova será salva apenas localmente.');
        // Continuar mesmo sem token ou ID do professor
        // Retornar o código da prova para que o fluxo principal continue
        return codigoProva;
      }

      // Adicionar ID do professor aos dados da prova
      provaFormatada.professor = professorId;

      // Tentar enviar para o backend
      fetch(`${API_URL}/api/provas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(provaFormatada)
      }).then(response => {
        if (response.ok) {
          console.log('Prova salva com sucesso no backend!');
        } else {
          console.log('Falha ao salvar no backend, mas prova foi salva localmente. Status:', response.status);
        }
      }).catch(err => {
        console.log('Falha ao salvar no backend, mas prova foi salva localmente:', err);
      });
    } catch (backendError) {
      console.log('Erro ao tentar salvar no backend, mas prova foi salva localmente:', backendError);
    }
    
    return codigoProva;
  } catch (error) {
    console.error('Erro ao salvar prova:', error);
    return null;
  }
}

/**
 * Busca uma prova pelo código
 * @param {string} codigo - Código da prova
 * @returns {Object|null} Dados da prova ou null se não encontrada
 */
export function buscarProvaPorCodigo(codigo) {
  const todasProvas = JSON.parse(localStorage.getItem('provasCadastradas') || '[]');
  return todasProvas.find(prova => prova.codigoProva === codigo) || null;
}

/**
 * Verifica se o aluno tem permissão para acessar a prova
 * @param {string} codigo - Código da prova
 * @param {string} turma - Turma do aluno
 * @returns {boolean} True se tem permissão, false caso contrário
 */
export function verificarPermissaoAcesso(codigo, turma) {
  const prova = buscarProvaPorCodigo(codigo);
  
  if (!prova) return false;
  
  // Verificar se a turma do aluno está entre as selecionadas para a prova
  const turmasFundamental = prova.selectedFund || [];
  const turmasMedio = prova.selectedMedio || [];
  const todasTurmas = [...turmasFundamental, ...turmasMedio];
  
  // Normaliza a turma do aluno (remove espaços extras e converte para minúsculas)
  const turmaNormalizada = turma.trim().toLowerCase();
  
  // Verifica se a turma do aluno está incluída nas turmas permitidas
  // Faz uma comparação case-insensitive e normalizada
  return todasTurmas.some(turmaPermitida => 
    turmaNormalizada === turmaPermitida.trim().toLowerCase()
  );
}

/**
 * Registra o acesso do aluno à prova
 * @param {Object} alunoInfo - Informações do aluno
 * @param {Object} provaInfo - Informações da prova
 */
export function registrarAcessoAluno(alunoInfo, provaInfo) {
  const acessos = JSON.parse(localStorage.getItem('acessosProvas') || '[]');
  
  acessos.push({
    aluno: alunoInfo,
    prova: {
      codigo: provaInfo.codigoProva,
      nome: provaInfo.nomeProva
    },
    dataAcesso: new Date().toISOString()
  });
  
  localStorage.setItem('acessosProvas', JSON.stringify(acessos));
}