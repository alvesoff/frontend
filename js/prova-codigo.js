// ===========================
// PROVA-CODIGO.JS
// ===========================

/**
 * Gera um código único para a prova
 * Formato: XXXX-XXXX-XXXX (onde X pode ser letra ou número)
 * @returns {string} Código único da prova
 */
function gerarCodigoProva() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  
  // Gerar 3 blocos de 4 caracteres
  for (let bloco = 0; bloco < 3; bloco++) {
    for (let i = 0; i < 4; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres.charAt(indice);
    }
    if (bloco < 2) codigo += '-';
  }
  
  return codigo;
}

/**
 * Comprime uma imagem base64 para reduzir seu tamanho
 * @param {string} base64Image - Imagem em formato base64
 * @param {number} maxWidth - Largura máxima da imagem
 * @param {number} quality - Qualidade da imagem (0-1)
 * @returns {Promise<string>} Imagem comprimida em formato base64
 */
async function comprimirImagem(base64Image, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    try {
      // Se não for uma imagem base64, retorna a string original
      if (!base64Image || !base64Image.startsWith('data:image')) {
        return resolve(base64Image);
      }
      
      const img = new Image();
      img.src = base64Image;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Redimensionar se a largura for maior que o máximo
        if (width > maxWidth) {
          height = Math.floor(height * (maxWidth / width));
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para base64 com qualidade reduzida
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = (error) => {
        console.error('Erro ao carregar imagem:', error);
        resolve(base64Image); // Em caso de erro, retorna a imagem original
      };
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      resolve(base64Image); // Em caso de erro, retorna a imagem original
    }
  });
}

/**
 * Salva a prova com seu código único no backend
 * @param {Object} provaData - Dados da prova
 * @returns {Promise<string>} Código da prova gerado
 */
async function salvarProvaComCodigo(provaData) {
  // Usar a configuração centralizada da API
  const API_URL = API_CONFIG.BASE_URL;
  
  // Garantir que a data de criação está definida
  provaData.dataCriacao = new Date().toISOString();
  
  // Verificar campos obrigatórios
  if (!provaData.titulo || !provaData.serie || !provaData.turmas || 
      !provaData.dataInicio || !provaData.dataFim || !provaData.professor || 
      !provaData.questoes) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos');
  }
  
  // Formatar datas corretamente
  provaData.dataInicio = new Date(provaData.dataInicio).toISOString();
  provaData.dataFim = new Date(provaData.dataFim).toISOString();
  
  // Verificar se há pelo menos 1 questão
  if (provaData.questoes.length === 0) {
    throw new Error('A prova deve ter pelo menos 1 questão');
  }
  
  try {
    // Obter token do localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Token não encontrado. Faça login novamente.');
      window.location.href = '/pages/login-professor.html';
      return null;
    }
    
    // Gerar código da prova se não existir
    const codigoProva = provaData.codigoProva || gerarCodigoProva();
    
    // Comprimir imagens das questões para reduzir o tamanho do payload
    const questoesProcessadas = [];
    for (const questao of provaData.questoes || []) {
      const questaoProcessada = {...questao};
      
      // Comprimir a imagem se existir
      if (questao.imagem) {
        try {
          // Comprimir para no máximo 800px de largura e 70% de qualidade
          questaoProcessada.imagem = await comprimirImagem(questao.imagem, 800, 0.7);
          console.log('Imagem comprimida com sucesso');
        } catch (imgError) {
          console.error('Erro ao comprimir imagem:', imgError);
          // Manter a imagem original em caso de erro
        }
      }
      
      questoesProcessadas.push(questaoProcessada);
    }
    
    // Mapear os dados da prova para o formato esperado pelo backend
    const provaFormatada = {
      titulo: provaData.nomeProva,
      disciplina: [...(provaData.componentesFundamental || []), ...(provaData.componentesMedio || [])].join(', '),
      serie: provaData.selectedFund.length > 0 ? 'Fundamental' : 'Médio',
      turmas: [...(provaData.selectedFund || []), ...(provaData.selectedMedio || [])],
      questoes: questoesProcessadas.map(q => ({
        enunciado: q.enunciado,
        alternativas: (q.alternativas || []).map((alt, index) => ({
          texto: alt,
          correta: index === parseInt(q.correctAlternative, 10)
        })),
        pontuacao: 1,
        dificuldade: q.difficulty || 'PADRÃO',
        serie: q.series || '',
        imagem: q.imagem || null // Incluir a imagem comprimida se existir
      })),
      dataInicio: new Date().toISOString(),
      dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias a partir de agora
      duracao: 60,
      codigoProva: codigoProva
    };
    
    // Verificar tamanho do payload antes de enviar
    const payloadSize = new Blob([JSON.stringify(provaFormatada)]).size;
    console.log(`Tamanho do payload: ${(payloadSize / (1024 * 1024)).toFixed(2)} MB`);
    
    if (payloadSize > 10 * 1024 * 1024) {
      console.error('Payload muito grande, tentando reduzir mais a qualidade das imagens');
      // Tentar comprimir ainda mais as imagens se o payload for muito grande
      for (let i = 0; i < provaFormatada.questoes.length; i++) {
        if (provaFormatada.questoes[i].imagem) {
          provaFormatada.questoes[i].imagem = await comprimirImagem(provaFormatada.questoes[i].imagem, 600, 0.5);
        }
      }
    }
    
    // Enviar prova para o backend
    try {
      const response = await fetch(`${API_URL}/api/provas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(provaFormatada),
        mode: 'cors'
        // Removido credentials: 'include' para evitar erro de CORS
      });
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do servidor:', response.status, errorText);
        throw new Error(`Erro do servidor: ${response.status}`);
      }
    
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro ao salvar prova:', data.msg);
        return null;
      }
      
      console.log('Prova salva com sucesso no banco de dados:', data);
      return codigoProva;
    } catch (innerError) {
      console.error('Erro ao enviar para o servidor:', innerError);
      return null;
    }
    
  } catch (error) {
    console.error('Erro ao salvar prova:', error);
    return null;
  }
}

/**
 * Busca uma prova pelo código
 * @param {string} codigo - Código da prova
 * @returns {Promise<Object|null>} Dados da prova ou null se não encontrada
 */
async function buscarProvaPorCodigo(codigo) {
  try {
    // Usar a configuração centralizada da API
    const API_URL = API_CONFIG.BASE_URL;
    
    // Removida a verificação de token para permitir acesso público às provas
    const response = await fetch(`${API_URL}/api/provas/${codigo}`, {
      method: 'GET'
      // Removido o cabeçalho com token
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar prova:', error);
    return null;
  }
}

/**
 * Verifica se o aluno tem permissão para acessar a prova
 * @param {string} codigo - Código da prova
 * @param {string} turma - Turma do aluno
 * @returns {Promise<boolean>} True se tem permissão, false caso contrário
 */
async function verificarPermissaoAcesso(codigo, turma) {
  const prova = await buscarProvaPorCodigo(codigo);
  
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
 * @returns {Promise<void>}
 */
async function registrarAcessoAluno(alunoInfo, provaInfo) {
  try {
    // Usar a configuração centralizada da API
    const API_URL = API_CONFIG.BASE_URL;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Token não encontrado. Faça login novamente.');
      window.location.href = '/pages/login-professor.html';
      return;
    }
    
    await fetch(`${API_URL}/acessos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        aluno: alunoInfo,
        prova: {
          codigo: provaInfo.codigoProva,
          nome: provaInfo.nomeProva
        },
        dataAcesso: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
  }
}