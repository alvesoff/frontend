// ===========================
// FINALIZAR-PROVA.JS
// ===========================

// Verificar se API_CONFIG está disponível
if (typeof API_CONFIG === 'undefined') {
  console.error('API_CONFIG não encontrado. Por favor, verifique se o arquivo api-config.js está incluído.');
  window.location.href = '/pages/login-professor.html';
}

// Global para as questões selecionadas (persistência via localStorage)
let selectedQuestions = JSON.parse(localStorage.getItem('selectedQuestions')) || [];

// Botão VOLTAR
const btnVoltar = document.getElementById('btnVoltar');
btnVoltar.addEventListener('click', () => {
  window.history.back();
});

// Botão EDITAR
const btnEditar = document.getElementById('btnEditar');
btnEditar.addEventListener('click', () => {
  alert("Funcionalidade de edição em breve!");
});

// Função para buscar questões com filtros
async function buscarQuestoes(filtros = {}) {
  try {
    // Usar a configuração global da API
    const API_URL = API_CONFIG.QUESTOES_API_URL;
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Você precisa estar logado para buscar questões.');
      return [];
    }
    
    // Construir a URL com os parâmetros de filtro
    let url = `${API_URL}/api/v1/questoes?`;
    
    // Adicionar termo de busca se existir
    if (filtros.termo) {
      url += `q=${encodeURIComponent(filtros.termo)}&`;
    }
    
    // Adicionar filtro de disciplina
    if (filtros.disciplina && filtros.disciplina !== '') {
      url += `disciplina=${encodeURIComponent(filtros.disciplina)}&`;
    }
    
    // Adicionar filtro de ano escolar
    if (filtros.anoEscolar && filtros.anoEscolar !== '') {
      // Converter para número para garantir formato correto
      const anoEscolar = Number(filtros.anoEscolar);
      if (!isNaN(anoEscolar)) {
        url += `anoEscolar=${anoEscolar}&`;
      }
    }
    
    // Adicionar filtro de nível de dificuldade
    if (filtros.nivelDificuldade && filtros.nivelDificuldade !== '') {
      url += `nivelDificuldade=${encodeURIComponent(filtros.nivelDificuldade)}&`;
    }
    
    // Adicionar filtro de tags
    if (filtros.tags && filtros.tags !== '') {
      // Remover espaços extras e garantir formato correto
      const tagsFormatadas = filtros.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')
        .join(',');
      
      if (tagsFormatadas) {
        url += `tags=${encodeURIComponent(tagsFormatadas)}&`;
      }
    }
    
    // Remover o último '&' se existir
    url = url.endsWith('&') ? url.slice(0, -1) : url;
    
    console.log('URL de busca:', url); // Log para debug
    
    // Buscar questões no backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert(data.msg || 'Erro ao buscar questões. Tente novamente.');
      return [];
    }
    
    // Processar a resposta da API conforme o formato esperado
    // A API retorna um objeto com status, results e data
    if (data.status === 'success' && Array.isArray(data.data)) {
      console.log('Questões encontradas:', data.results);
      return data.data;
    } else if (Array.isArray(data)) {
      // Caso a API retorne diretamente um array
      console.log('Questões encontradas (array):', data.length);
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      // Formato alternativo onde data contém o array
      console.log('Questões encontradas (data.data):', data.data.length);
      return data.data;
    } else {
      console.warn('Formato de resposta inesperado:', data);
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    return [];
  }
}

// Função para exibir questões na interface
function exibirQuestoes(questoes) {
  const questionsSection = document.querySelector('.questions-section');
  
  // Limpar questões fixas de exemplo
  questionsSection.innerHTML = '';
  
  if (!questoes || questoes.length === 0) {
    questionsSection.innerHTML = '<p class="no-questions">Nenhuma questão encontrada com os filtros selecionados.</p>';
    return;
  }
  
  console.log(`Exibindo ${questoes.length} questões na interface`);
  
  // Exibir as questões encontradas
  questoes.forEach(questao => {
    const card = document.createElement('div');
    card.classList.add('question-card');
    
    // Determinar a série/ano baseado no campo anoEscolar
    let seriesInfo = questao.anoEscolar || '';
    if (typeof seriesInfo === 'string' || typeof seriesInfo === 'number') {
      // Formatar o ano escolar corretamente
      const anoFormatado = seriesInfo.toString();
      seriesInfo = `(${anoFormatado}º Ano)`;
    } else {
      seriesInfo = '(Ano não especificado)';
    }
    
    // Verificar o formato das alternativas (API v1 pode ter formato diferente)
    let alternativasHTML = '';
    if (questao.alternativas && Array.isArray(questao.alternativas)) {
      // Verificar se as alternativas são objetos com propriedade 'texto' e 'correta'
      if (questao.alternativas.length > 0 && typeof questao.alternativas[0] === 'object') {
        alternativasHTML = questao.alternativas.map((alt, idx) => `
          <li${alt.correta ? ' class="correct-alternative"' : ''}>
            <span class="alternative-letter">${String.fromCharCode(97 + idx)})</span> ${alt.texto || ''}
          </li>`).join('');
      } else {
        // Alternativas são strings simples
        alternativasHTML = questao.alternativas.map((alt, idx) => `
          <li${idx === (questao.respostaCorreta || 0) ? ' class="correct-alternative"' : ''}>
            <span class="alternative-letter">${String.fromCharCode(97 + idx)})</span> ${alt || ''}
          </li>`).join('');
      }
    } else {
      // Caso não tenha alternativas
      alternativasHTML = '<li>Sem alternativas disponíveis</li>';
    }
    
    // Verificar se há tags para exibir
    const tagsHTML = questao.tags && questao.tags.length > 0 ? 
      `<div class="question-tags"><span>Tags:</span> ${Array.isArray(questao.tags) ? questao.tags.join(', ') : questao.tags}</div>` : '';
    
    card.innerHTML = `
      <div class="question-header">
        <span class="question-info">Questão ${questao.disciplina || 'Geral'} | ${seriesInfo}</span>
        <span class="question-difficulty">${questao.nivelDificuldade || questao.dificuldade || 'PADRÃO'}</span>
      </div>
      <p class="question-enunciado">${questao.enunciado || 'Sem enunciado'}</p>
      ${tagsHTML}
      <ul class="question-alternativas">
        ${alternativasHTML}
      </ul>
      <button class="btn-add-questao">ADICIONAR</button>
    `;
    questionsSection.appendChild(card);
  });
  
  // Adicionar event listeners para os botões de adicionar
  attachAddQuestionListeners();
}

// Botão BUSCAR removido

// Botão APLICAR FILTROS
const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
btnAplicarFiltros.addEventListener('click', async () => {
  // Obter valores dos filtros
  const disciplina = document.getElementById('disciplinaFiltro').value;
  const anoEscolar = document.getElementById('anoEscolarFiltro').value;
  const dificuldade = document.getElementById('dificuldadeFiltro').value;
  const tags = document.getElementById('tagsFiltro').value.trim();
  
  // Criar objeto de filtros
  const filtros = {};
  
  // Adicionar apenas filtros com valores válidos
  if (disciplina) filtros.disciplina = disciplina;
  if (anoEscolar) filtros.anoEscolar = anoEscolar;
  if (dificuldade) filtros.nivelDificuldade = dificuldade;
  if (tags) filtros.tags = tags;
  
  console.log('Aplicando filtros:', filtros);
  
  // Buscar questões com os filtros
  const questoes = await buscarQuestoes(filtros);
  
  // Exibir questões encontradas
  exibirQuestoes(questoes);
});

// Evento de tecla Enter no campo de busca removido

// Atualizar automaticamente o número de questões adicionadas
const numeroQuestoes = document.getElementById('numeroQuestoes');

// Função para atualizar o contador de questões
function atualizarContadorQuestoes() {
  const questoesAdicionadas = JSON.parse(localStorage.getItem('selectedQuestions')) || [];
  numeroQuestoes.value = questoesAdicionadas.length;
  // Salvar no localStorage para persistência
  localStorage.setItem('numeroQuestoes', numeroQuestoes.value);
}

// Função para atualizar os botões após remover uma questão
function atualizarBotoesAposRemocao() {
  const addButtons = document.querySelectorAll('.btn-add-questao');
  const storedQuestions = JSON.parse(localStorage.getItem('selectedQuestions')) || [];
  
  addButtons.forEach(button => {
    const card = button.closest('.question-card');
    const enunciado = card.querySelector('.question-enunciado').innerHTML;
    
    // Verifica se a questão ainda está na lista de selecionadas
    const questaoAdicionada = storedQuestions.some(q => q.enunciado === enunciado);
    
    // Se não estiver mais na lista, restaura o botão para o estado original
    if (!questaoAdicionada) {
      button.textContent = 'ADICIONAR';
      button.disabled = false;
      button.style.backgroundColor = '';
    }
  });
}

// Atualizar contador ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  // Tornar o campo somente leitura, já que agora é automático
  numeroQuestoes.setAttribute('readonly', true);
  atualizarContadorQuestoes();
});

// Limitar número de questões (máx 90)
numeroQuestoes.addEventListener('change', () => {
  if (parseInt(numeroQuestoes.value, 10) > 90) {
    numeroQuestoes.value = 90;
    alert("Número máximo de questões é 90.");
  }
  localStorage.setItem('numeroQuestoes', numeroQuestoes.value);
});


// Inicialização das variáveis globais
let questoesPessoais = JSON.parse(localStorage.getItem('questoesPessoais') || '[]');

// Carregar dados da prova e questões pessoais salvas
window.addEventListener('DOMContentLoaded', async () => {
  // Nome da prova
  const storedNomeProva = localStorage.getItem('nomeProva');
  if (storedNomeProva) {
    document.getElementById('nomeProva').value = storedNomeProva;
  }
  
  // Salas e disciplinas
  const selectedFund = JSON.parse(localStorage.getItem('selectedFund') || '[]');
  const selectedMedio = JSON.parse(localStorage.getItem('selectedMedio') || '[]');
  const componentesFundamental = JSON.parse(localStorage.getItem('componentesFundamental') || '[]');
  const componentesMedio = JSON.parse(localStorage.getItem('componentesMedio') || '[]');
  
  const salasSelecionadas = [...selectedFund, ...selectedMedio];
  const disciplinasSelecionadas = [...componentesFundamental, ...componentesMedio];
  
  const dadosHTML = `
    <p><strong>Salas selecionadas:</strong> ${salasSelecionadas.length ? salasSelecionadas.join(', ') : 'Nenhuma'}</p>
    <p><strong>Disciplinas selecionadas:</strong> ${disciplinasSelecionadas.length ? disciplinasSelecionadas.join(', ') : 'Nenhuma'}</p>
  `;
  document.getElementById('dadosSelecionados').innerHTML = dadosHTML;
  
  // Limpar a seção de questões
  const questionsSection = document.querySelector('.questions-section');
  questionsSection.innerHTML = '';
  
  // Carregar questões iniciais da API
  try {
    // Usar filtros iniciais baseados nas disciplinas selecionadas
    let filtrosIniciais = {};
    if (disciplinasSelecionadas.length > 0) {
      filtrosIniciais.disciplina = disciplinasSelecionadas[0]; // Usar a primeira disciplina como filtro inicial
    }
    
    // Buscar questões iniciais
    const questoesIniciais = await buscarQuestoes(filtrosIniciais);
    
    if (questoesIniciais.length > 0) {
      exibirQuestoes(questoesIniciais);
    } else {
      // Se não encontrou questões com os filtros iniciais, exibir mensagem
      questionsSection.innerHTML = '<p class="no-questions">Use os filtros acima para buscar questões ou clique em "Aplicar Filtros".</p>';
    }
  } catch (error) {
    console.error('Erro ao carregar questões iniciais:', error);
    questionsSection.innerHTML = '<p class="no-questions">Erro ao carregar questões. Por favor, tente novamente.</p>';
  }
  
  // Carrega questões pessoais
  const storedQuestoes = JSON.parse(localStorage.getItem('questoesPessoais') || '[]');
  if (storedQuestoes.length > 0) {
    storedQuestoes.forEach(questao => {
      const card = document.createElement('div');
      card.classList.add('question-card');
      
      // Determinar a série/ano para exibição
      let seriesInfo = questao.seriesIndicada || questao.series || '';
      
      // Preparar tags para exibição
      const tagsHTML = questao.tags && questao.tags.length > 0 ? 
        `<div class="question-tags"><span>Tags:</span> ${questao.tags.join(', ')}</div>` : '';
      
      card.innerHTML = `
        <div class="question-header">
          <span class="question-info">Questão ${questao.disciplina || 'Personalizada'}</span>
          <span class="question-series"><b>Série/Ano:</b> ${seriesInfo}</span>
          <span class="question-difficulty">${questao.difficulty || 'PADRÃO'}</span>
        </div>
        <p class="question-enunciado">${questao.enunciado}</p>
        ${questao.imagem ? `<div class="question-image"><img src="${questao.imagem}" alt="Imagem da questão" /></div>` : ''}
        ${tagsHTML}
        <ul class="question-alternativas">
          ${questao.alternativas.map((alt, idx) => {
            // Verificar se alternativas é um array de objetos ou strings
            const isObject = typeof alt === 'object';
            const texto = isObject ? alt.texto : alt;
            const isCorrect = isObject ? alt.correta : idx === parseInt(questao.correctAlternativeIndex || questao.correctAlternative, 10);
            
            return `<li${isCorrect ? ' class="correct-alternative"' : ''}>
              <span class="alternative-letter">${String.fromCharCode(97 + idx)})</span> ${texto}
            </li>`;
          }).join('')}
        </ul>
        <button class="btn-add-questao">ADICIONAR</button>
      `;
      questionsSection.appendChild(card);
    });
  }
  
  // Inicializar os event listeners para os botões de adicionar
  attachAddQuestionListeners();
});

// Função para extrair dados da questão a partir de um card
function getQuestionData(card) {
  const correctAlternativeIndex = Array.from(card.querySelectorAll('.question-alternativas li'))
    .findIndex(li => li.classList.contains('correct-alternative'));
  
  // Extrair informações da série de forma mais robusta
  let seriesInfo = '';
  const questionInfo = card.querySelector('.question-info');
  if (questionInfo) {
    const infoText = questionInfo.innerText;
    // Verifica se contém o caractere | para separar
    if (infoText.includes('|')) {
      seriesInfo = infoText.split('|')[1]?.trim() || '';
    } else if (infoText.includes('Série/Ano:')) {
      // Tenta extrair da string "Série/Ano: X"
      seriesInfo = infoText.split('Série/Ano:')[1]?.trim() || '';
    } else {
      seriesInfo = infoText.trim();
    }
  }
    
  return {
    enunciado: card.querySelector('.question-enunciado').innerHTML,
    alternativas: Array.from(card.querySelectorAll('.question-alternativas li'))
                    .map(li => li.innerText.trim()),
    difficulty: card.querySelector('.question-difficulty').innerText.trim(),
    correctAlternative: correctAlternativeIndex >= 0 ? correctAlternativeIndex : 0,
    series: seriesInfo
  };
}

// Adiciona event listener para os botões "ADICIONAR" (fixas e pessoais)
function attachAddQuestionListeners() {
  const addButtons = document.querySelectorAll('.btn-add-questao');
  addButtons.forEach(button => {
    // Remove listeners duplicados, se necessário
    button.removeEventListener('click', addQuestionHandler);
    button.addEventListener('click', addQuestionHandler);
    
    // Verifica se a questão já está no localStorage para atualizar o botão
    const card = button.closest('.question-card');
    const enunciado = card.querySelector('.question-enunciado').innerHTML;
    
    // Carrega as questões atuais do localStorage
    const storedQuestions = JSON.parse(localStorage.getItem('selectedQuestions')) || [];
    
    // Se a questão já estiver no localStorage, atualiza o botão
    if (storedQuestions.some(q => q.enunciado === enunciado)) {
      button.textContent = 'ADICIONADA';
      button.disabled = true;
      button.style.backgroundColor = '#4CAF50';
    }
  });
}

function addQuestionHandler() {
  const card = this.closest('.question-card');
  const questionData = getQuestionData(card);
  
  // Carrega as questões atuais do localStorage
  const storedQuestions = JSON.parse(localStorage.getItem('selectedQuestions')) || [];
  
  // Verifica se a questão já foi adicionada
  if (!storedQuestions.some(q => q.enunciado === questionData.enunciado)) {
    // Adiciona a nova questão
    storedQuestions.push(questionData);
    
    // Salva de volta no localStorage
    localStorage.setItem('selectedQuestions', JSON.stringify(storedQuestions));
    
    // Atualiza a variável global
    selectedQuestions = storedQuestions;
    
    // Atualiza o botão
    this.textContent = 'ADICIONADA';
    this.disabled = true;
    this.style.backgroundColor = '#4CAF50';
    
    // Atualiza o contador de questões
    atualizarContadorQuestoes();
    
    console.log('Questão adicionada com sucesso!', questionData);
  } else {
    alert("Essa questão já foi adicionada.");
  }
}
// Atualiza o visualizador de prova para usar os dados corretos
const btnVisualizar = document.getElementById('btnVisualizar');
const modalVisualizarProva = document.getElementById('modalVisualizarProva');
const closeModalVisualizarProva = document.getElementById('closeModalVisualizarProva');
const selectedQuestionsList = document.getElementById('selectedQuestionsList');

btnVisualizar.addEventListener('click', () => {
  // Atualiza a lista a partir do localStorage
  const currentQuestions = JSON.parse(localStorage.getItem('selectedQuestions')) || [];
  selectedQuestions = currentQuestions;
  selectedQuestionsList.innerHTML = '';

  if (selectedQuestions.length === 0) {
    selectedQuestionsList.innerHTML = '<p>Nenhuma questão selecionada.</p>';
  } else {
    selectedQuestions.forEach((q, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.classList.add('selected-question');
      
      // Preparar HTML da imagem se existir
      const imagemHTML = q.imagem ? `<div class="question-image"><img src="${q.imagem}" alt="Imagem da questão" /></div>` : '';
      
      questionDiv.innerHTML = `
        <p><strong>Enunciado:</strong> ${q.enunciado}</p>
        ${imagemHTML}
        <ul>
          ${q.alternativas.map((alt, i) => 
            `<li ${i === q.correctAlternative ? 'class="correct-alternative"' : ''}>${alt}</li>`
          ).join('')}
        </ul>
        <p><strong>Dificuldade:</strong> ${q.difficulty}</p>
        <button class="delete-question" data-index="${index}">Excluir</button>
        <hr>
      `;
      selectedQuestionsList.appendChild(questionDiv);
    });
  }
  modalVisualizarProva.style.display = 'flex';
});

// Fechar modal ao clicar no botão de fechar ou fora da área
closeModalVisualizarProva.addEventListener('click', () => {
  modalVisualizarProva.style.display = 'none';
  // Atualiza os botões ao fechar o modal para garantir que reflitam o estado atual
  atualizarBotoesAposRemocao();
  // Limpar questões selecionadas ao fechar o modal
  localStorage.removeItem('selectedQuestions');
  selectedQuestions = [];
  atualizarContadorQuestoes();
});

modalVisualizarProva.addEventListener('click', (e) => {
  if (e.target === modalVisualizarProva) {
    modalVisualizarProva.style.display = 'none';
    // Atualiza os botões ao fechar o modal para garantir que reflitam o estado atual
    atualizarBotoesAposRemocao();
    // Limpar questões selecionadas ao fechar o modal
    localStorage.removeItem('selectedQuestions');
    selectedQuestions = [];
    atualizarContadorQuestoes();
  }
});

// Delegação para editar e excluir questões no modal
// Update the event listener to handle only delete
selectedQuestionsList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-question')) {
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    const removedQuestion = selectedQuestions[index];
    selectedQuestions.splice(index, 1);
    localStorage.setItem('selectedQuestions', JSON.stringify(selectedQuestions));
    e.target.closest('.selected-question').remove();
    
    // Atualiza o contador de questões após remover uma questão
    atualizarContadorQuestoes();
    
    // Atualiza os botões na lista de questões para refletir a remoção
    atualizarBotoesAposRemocao();
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const finalizarProvaBtn = document.getElementById('finalizarProvaBtn');
  
  finalizarProvaBtn.addEventListener('click', async () => {
    // Cria o objeto com os dados da prova
    const provaData = {
      nomeProva: document.getElementById('nomeProva').value,
      selectedFund: JSON.parse(localStorage.getItem('selectedFund') || '[]'),
      selectedMedio: JSON.parse(localStorage.getItem('selectedMedio') || '[]'),
      componentesFundamental: JSON.parse(localStorage.getItem('componentesFundamental') || '[]'),
      componentesMedio: JSON.parse(localStorage.getItem('componentesMedio') || '[]'),
      extras: JSON.parse(localStorage.getItem('extras') || '[]'),
      numeroQuestoes: document.getElementById('numeroQuestoes').value,
      questoes: selectedQuestions
    };

    // Verifica se há questões selecionadas
    if (!provaData.questoes || provaData.questoes.length === 0) {
      alert("Nenhuma questão selecionada para gerar a prova!");
      return;
    }
    
    // Salva a prova no backend
    try {
      const API_URL = API_CONFIG.BASE_URL;
      const token = localStorage.getItem('token');
      const professorId = localStorage.getItem('professorId');

      if (!token || !professorId) {
        alert('Você precisa estar logado para salvar a prova.');
        return;
      }
      
      // Garantir que as imagens sejam incluídas corretamente
      if (provaData.questoes) {
        provaData.questoes.forEach(questao => {
          // Verificar se a imagem existe e está no formato correto
          if (questao.imagem && typeof questao.imagem === 'string' && !questao.imagem.startsWith('data:')) {
            console.warn('Formato de imagem inválido, será ignorada:', questao.imagem);
            questao.imagem = null;
          }
        });
      }

      // Formatar dados da prova para o backend
      const provaFormatada = {
        titulo: provaData.nomeProva,
        disciplina: [...(provaData.componentesFundamental || []), ...(provaData.componentesMedio || [])].join(', '),
        serie: provaData.selectedFund.length > 0 ? 'Fundamental' : 'Médio',
        turmas: [...(provaData.selectedFund || []), ...(provaData.selectedMedio || [])],
        professor: professorId,
        questoes: provaData.questoes.map(q => ({
          enunciado: q.enunciado,
          alternativas: q.alternativas.map((alt, index) => ({
            texto: alt,
            correta: index === parseInt(q.correctAlternative, 10)
          })),
          pontuacao: 1,
          dificuldade: q.difficulty || 'PADRÃO',
          serie: q.series || '',
          imagem: q.imagem || null // Incluir a imagem se existir
        })),
        dataInicio: new Date().toISOString(),
        dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        duracao: 60
      };

      // Enviar prova para o backend
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

      const data = await response.json();

      if (!response.ok) {
        alert('Erro ao salvar a prova: ' + (data.msg || 'Erro desconhecido'));
        return;
      }

      // Usar o código gerado pelo backend
      const codigoProva = data.data.codigoProva;
      
      // Exibe o código da prova para o professor
      alert(`Prova criada com sucesso!\nCódigo da prova: ${codigoProva}\nCompartilhe este código com seus alunos para que eles possam acessar a prova.`);
    
      // Cria uma instância do jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4'
      });
      
      let y = 10; // Posição inicial vertical no PDF
      
      // Cabeçalho do PDF
      doc.setFont("helvetica", "bold");
      doc.text("Prova Gerada", 10, y);
      y += 10;
      
      // Adiciona o código da prova ao PDF
      doc.text(`Código da prova: ${codigoProva}`, 10, y);
      y += 10;
      
      // Percorre cada questão e adiciona ao PDF
      selectedQuestions.forEach((q, index) => {
        doc.setFont("helvetica", "normal");
        // Enunciado da questão
        doc.text(`${index + 1}. ${q.enunciado}`, 10, y);
        y += 7;
        
        // Adiciona as alternativas
        q.alternativas.forEach((alt, idx) => {
          let letter = String.fromCharCode(97 + idx) + ')';
          let isCorrect = idx === parseInt(q.correctAlternative, 10);
          
          // Se for a alternativa correta, define cor verde
          if (isCorrect) {
            doc.setTextColor(0, 128, 0);
          } else {
            doc.setTextColor(0, 0, 0);
          }
          doc.text(`${letter} ${alt}`, 15, y);
          y += 5;
        });
        
        // Reseta a cor e adiciona um espaço entre as questões
        doc.setTextColor(0, 0, 0);
        y += 10;
        
        // Se ultrapassar o fim da página, adiciona uma nova página
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
      });
      
      // Salva o PDF com o nome "prova.pdf"
      doc.save('prova.pdf');
    } catch (error) {
      console.error('Erro ao salvar prova:', error);
      alert('Ocorreu um erro ao salvar a prova. Por favor, tente novamente.');
    }
  });
});


// Adicionar evento para limpar selectedQuestions ao sair da página
window.addEventListener('beforeunload', () => {
  localStorage.removeItem('selectedQuestions');
});

