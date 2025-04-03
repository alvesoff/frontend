// Minhas Provas - JavaScript

// Importar configurações da API
const API_URL = API_CONFIG.BASE_URL;

// Função para verificar se o professor está logado
function verificarLogin() {
  if (!API_CONFIG.isProfessorLoggedIn()) {
    window.location.href = '/pages/login-professor.html';
    return false;
  }
  return true;
}

// Função para buscar provas do professor do backend
async function buscarMinhasProvas() {
  try {
    // Verificar se o professor está logado
    if (!verificarLogin()) return [];
    
    // Buscar provas do professor
    const response = await fetch(`${API_URL}/provas`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders()
    });
    
    if (!response.ok) {
      console.error('Erro ao buscar provas do professor');
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar provas do professor:', error);
    return [];
  }
}

// Dados simulados para uso enquanto a API não retorna resultados
let minhasProvas = [];

// Elementos DOM
let examsListContainer;
let btnGerarProva;
let modalMinhasProvas;
let modalContent;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  examsListContainer = document.querySelector('.exams-list');
  btnGerarProva = document.querySelector('.exams-list .btn-secondary');
  
  // Criar container para as provas
  const provasContainer = document.createElement('div');
  provasContainer.className = 'provas-container';
  examsListContainer.appendChild(provasContainer);
  
  // Reposicionar o botão Gerar+ para o final
  examsListContainer.appendChild(btnGerarProva);
  
  // Adicionar evento ao botão Gerar+
  btnGerarProva.addEventListener('click', () => {
    const openModalBtn = document.getElementById('openModalBtn');
    if (openModalBtn) {
      openModalBtn.click();
    }
  });
  
  // Criar e adicionar o modal de detalhes da prova
  criarModalDetalhesProva();
  
  // Carregar as provas
  carregarProvas();
});

// Função para carregar as provas na interface
function carregarProvas() {
  const provasContainer = document.querySelector('.provas-container');
  provasContainer.innerHTML = '';
  
  // Verificar se há provas
  if (minhasProvas.length === 0) {
    const mensagem = document.createElement('p');
    mensagem.className = 'sem-provas';
    mensagem.textContent = 'Você ainda não tem provas criadas.';
    provasContainer.appendChild(mensagem);
    return;
  }
  
  // Adicionar cada prova ao container
  minhasProvas.forEach(prova => {
    const provaCard = criarCardProva(prova);
    provasContainer.appendChild(provaCard);
  });
}

// Função para criar um card de prova
function criarCardProva(prova) {
  const card = document.createElement('div');
  card.className = 'prova-card';
  card.dataset.id = prova.id;
  
  // Definir classe de status
  if (prova.status === 'Aplicada') {
    card.classList.add('status-aplicada');
  } else {
    card.classList.add('status-pendente');
  }
  
  // Título da prova
  const titulo = document.createElement('h3');
  titulo.textContent = prova.titulo;
  card.appendChild(titulo);
  
  // Informações da prova
  const info = document.createElement('div');
  info.className = 'prova-info';
  
  // Data
  const data = document.createElement('p');
  data.innerHTML = `<strong>Data:</strong> ${formatarData(prova.data)}`;
  info.appendChild(data);
  
  // Turma
  const turma = document.createElement('p');
  turma.innerHTML = `<strong>Turma:</strong> ${prova.turma}`;
  info.appendChild(turma);
  
  // Total de questões
  const questoes = document.createElement('p');
  questoes.innerHTML = `<strong>Questões:</strong> ${prova.totalQuestoes}`;
  info.appendChild(questoes);
  
  // Status
  const status = document.createElement('p');
  status.innerHTML = `<strong>Status:</strong> ${prova.status}`;
  info.appendChild(status);
  
  // Média (se aplicável)
  if (prova.status === 'Aplicada' && prova.mediaNotas !== null) {
    const media = document.createElement('p');
    media.innerHTML = `<strong>Média:</strong> ${prova.mediaNotas.toFixed(1)}`;
    info.appendChild(media);
  }
  
  card.appendChild(info);
  
  // Botões de ação
  const acoes = document.createElement('div');
  acoes.className = 'prova-acoes';
  
  // Botão de visualizar
  const btnVisualizar = document.createElement('button');
  btnVisualizar.className = 'btn-visualizar';
  btnVisualizar.textContent = 'Visualizar';
  btnVisualizar.addEventListener('click', () => mostrarDetalhesProva(prova));
  acoes.appendChild(btnVisualizar);
  
  // Botão de editar (apenas para provas pendentes)
  if (prova.status === 'Pendente') {
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-editar';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarProva(prova.id));
    acoes.appendChild(btnEditar);
  }
  
  // Botão de relatório (apenas para provas aplicadas)
  if (prova.status === 'Aplicada') {
    const btnRelatorio = document.createElement('button');
    btnRelatorio.className = 'btn-relatorio';
    btnRelatorio.textContent = 'Relatório';
    btnRelatorio.addEventListener('click', () => verRelatorio(prova.id));
    acoes.appendChild(btnRelatorio);
  }
  
  card.appendChild(acoes);
  
  return card;
}

// Função para criar o modal de detalhes da prova
function criarModalDetalhesProva() {
  // Criar o modal se ainda não existir
  if (!document.getElementById('modalMinhasProvas')) {
    modalMinhasProvas = document.createElement('div');
    modalMinhasProvas.id = 'modalMinhasProvas';
    modalMinhasProvas.className = 'modal-overlay';
    modalMinhasProvas.style.display = 'none';
    
    modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Botão para fechar o modal
    const btnFechar = document.createElement('button');
    btnFechar.className = 'close-modal-btn';
    btnFechar.innerHTML = '&times;';
    btnFechar.addEventListener('click', () => {
      modalMinhasProvas.style.display = 'none';
    });
    
    modalContent.appendChild(btnFechar);
    
    // Conteúdo do modal
    const conteudoProva = document.createElement('div');
    conteudoProva.id = 'conteudoProva';
    modalContent.appendChild(conteudoProva);
    
    modalMinhasProvas.appendChild(modalContent);
    document.body.appendChild(modalMinhasProvas);
    
    // Fechar o modal ao clicar fora do conteúdo
    modalMinhasProvas.addEventListener('click', (e) => {
      if (e.target === modalMinhasProvas) {
        modalMinhasProvas.style.display = 'none';
      }
    });
  }
}

// Função para mostrar os detalhes de uma prova no modal
function mostrarDetalhesProva(prova) {
  const conteudoProva = document.getElementById('conteudoProva');
  conteudoProva.innerHTML = '';
  
  // Título
  const titulo = document.createElement('h2');
  titulo.textContent = prova.titulo;
  conteudoProva.appendChild(titulo);
  
  // Informações detalhadas
  const detalhes = document.createElement('div');
  detalhes.className = 'prova-detalhes';
  
  // Data
  const data = document.createElement('p');
  data.innerHTML = `<strong>Data:</strong> ${formatarData(prova.data)}`;
  detalhes.appendChild(data);
  
  // Turma
  const turma = document.createElement('p');
  turma.innerHTML = `<strong>Turma:</strong> ${prova.turma}`;
  detalhes.appendChild(turma);
  
  // Total de questões
  const questoes = document.createElement('p');
  questoes.innerHTML = `<strong>Total de questões:</strong> ${prova.totalQuestoes}`;
  detalhes.appendChild(questoes);
  
  // Status
  const status = document.createElement('p');
  status.innerHTML = `<strong>Status:</strong> ${prova.status}`;
  detalhes.appendChild(status);
  
  // Média (se aplicável)
  if (prova.status === 'Aplicada' && prova.mediaNotas !== null) {
    const media = document.createElement('p');
    media.innerHTML = `<strong>Média da turma:</strong> ${prova.mediaNotas.toFixed(1)}`;
    detalhes.appendChild(media);
  }
  
  conteudoProva.appendChild(detalhes);
  
  // Botões de ação
  const acoes = document.createElement('div');
  acoes.className = 'modal-acoes';
  
  // Botão para ir ao dashboard
  const btnDashboard = document.createElement('button');
  btnDashboard.className = 'btn-primary';
  btnDashboard.textContent = 'Ver no Dashboard';
  btnDashboard.addEventListener('click', () => {
    window.location.href = 'dashboard-professor.html';
  });
  acoes.appendChild(btnDashboard);
  
  // Botão para fechar
  const btnFechar = document.createElement('button');
  btnFechar.className = 'btn-secondary';
  btnFechar.textContent = 'Fechar';
  btnFechar.addEventListener('click', () => {
    modalMinhasProvas.style.display = 'none';
  });
  acoes.appendChild(btnFechar);
  
  conteudoProva.appendChild(acoes);
  
  // Exibir o modal
  modalMinhasProvas.style.display = 'flex';
}

// Função para editar uma prova
function editarProva(provaId) {
  // Redireciona para uma página de edição com o ID da prova
  window.location.href = `editar-prova.html?id=${provaId}`;
}

// Função para ver o relatório de uma prova
function verRelatorio(provaId) {
  // Em um ambiente real, isso redirecionaria para a página de relatório
  // Para este exemplo, redirecionamos para o dashboard
  window.location.href = 'dashboard-professor.html';
}

// Função auxiliar para formatar a data
function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}