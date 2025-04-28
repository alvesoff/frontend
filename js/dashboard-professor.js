// Dashboard do Professor - JavaScript

// Importar configurações da API
const API_URL = API_CONFIG.BASE_URL;

// Função para obter token (temporariamente modificada para testes)
function getToken() {
  // TEMPORARIAMENTE MODIFICADO PARA TESTES
  // Retorna um token fictício para evitar erros
  return 'token-temporario-para-testes';
}

// Função para verificar se o professor está logado
function verificarLogin() {
  // TEMPORARIAMENTE DESATIVADO PARA TESTES
  // if (!API_CONFIG.isProfessorLoggedIn()) {
  //   window.location.href = '/pages/login-professor.html';
  //   return false;
  // }
  return true;
}

// Função para buscar dados do professor do backend
async function buscarDadosProfessor() {
  try {
    // Verificar se o professor está logado
    if (!verificarLogin()) return null;
    
    // TEMPORARIAMENTE MODIFICADO PARA TESTES
    // Como o login está desativado, podemos não ter um token válido
    // Vamos usar dados simulados diretamente para testes
    console.log('Usando dados simulados para testes (login temporariamente desativado)');
    return criarDadosSimulados();
    
    /* CÓDIGO ORIGINAL COMENTADO
    const token = getToken();
    
    // Buscar provas do professor
    const provasResponse = await fetch(`${API_URL}/api/provas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    // Buscar resultados das provas
    const resultadosResponse = await fetch(`${API_URL}/resultados`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    if (!provasResponse.ok || !resultadosResponse.ok) {
      console.error('Erro ao buscar dados do professor');
      return null;
    }
    
    const provasData = await provasResponse.json();
    const resultadosData = await resultadosResponse.json();
    
    return {
      provas: provasData.data || [],
      resultados: resultadosData.data || []
    };
    */
  } catch (error) {
    console.error('Erro ao buscar dados do professor:', error);
    return null;
  }
}

// Elementos DOM
const turmaFilter = document.getElementById('turmaFilter');
const provaFilter = document.getElementById('provaFilter');
const btnExportar = document.getElementById('btnExportar');
const totalProvasEl = document.getElementById('totalProvas');
const mediaGeralEl = document.getElementById('mediaGeral');
const totalAlunosEl = document.getElementById('totalAlunos');
const taxaAprovacaoEl = document.getElementById('taxaAprovacao');
const resultsTableBody = document.getElementById('resultsTableBody');
const modalDetalhes = document.getElementById('modalDetalhes');
const provaDetalhes = document.getElementById('provaDetalhes');
const alunoFilter = document.getElementById('alunoFilter');
let desempenhoChart = null; // Gráfico de desempenho por turma
let evolucaoChart = null; // Gráfico de evolução temporal
let conteudoChart = null; // Gráfico de desempenho por conteúdo
let chartType = 'bar'; // Definir variável global para o tipo de gráfico
let viewType = 'media'; // Definir variável global para o tipo de visualização
let dadosSimulados = { provas: [], resultados: [] }; // Inicializar dadosSimulados
let alunosComBaixoDesempenho = []; // Lista de alunos com baixo desempenho

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  // Carregar dados reais ou usar dados simulados se não puder conectar à API
  const dadosProfessor = await buscarDadosProfessor();
  if (dadosProfessor) {
    dadosSimulados = dadosProfessor;
  } else {
    // Criar alguns dados simulados se a API não estiver disponível
    dadosSimulados = criarDadosSimulados();
  }
  
  carregarFiltroProvas();
  inicializarGraficos(); // Inicializar todos os gráficos
  aplicarFiltros(); // Depois aplicar os filtros
  
  // Event listeners
  turmaFilter.addEventListener('change', aplicarFiltros);
  provaFilter.addEventListener('change', aplicarFiltros);
  btnExportar.addEventListener('click', exportarRelatorio);
  document.getElementById('btnExportarDetalhes').addEventListener('click', exportarDetalhes);
  document.getElementById('alunoFilter').addEventListener('input', filtrarPorAluno);
  
  // Adicionar listener para fechar o modal
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('btn-primary')) {
      fecharModal();
    }
  });
  
  // Verificar alunos com baixo desempenho e mostrar alertas
  verificarAlunosBaixoDesempenho();
});


// Função para criar dados simulados quando a API não estiver disponível
function criarDadosSimulados() {
  const provas = [
    { id: 'PROVA001', titulo: 'Avaliação de Matemática', dataAplicacao: '2023-10-15', turma: '1º Ano' },
    { id: 'PROVA002', titulo: 'Avaliação de Português', dataAplicacao: '2023-10-20', turma: '2º Ano' },
    { id: 'PROVA003', titulo: 'Avaliação de Ciências', dataAplicacao: '2023-11-05', turma: '1º Ano, 2º Ano' }
  ];
  
  const resultados = [
    {
      alunoId: 'ALU001',
      alunoNome: 'João Silva',
      turma: '1º Ano',
      provaId: 'PROVA001',
      nota: 8.5,
      dataRealizacao: '2023-10-15',
      respostas: Array(10).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.2 }))
    },
    {
      alunoId: 'ALU002',
      alunoNome: 'Maria Oliveira',
      turma: '1º Ano',
      provaId: 'PROVA001',
      nota: 7.0,
      dataRealizacao: '2023-10-15',
      respostas: Array(10).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.3 }))
    },
    {
      alunoId: 'ALU003',
      alunoNome: 'Pedro Santos',
      turma: '2º Ano',
      provaId: 'PROVA002',
      nota: 9.0,
      dataRealizacao: '2023-10-20',
      respostas: Array(8).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.1 }))
    },
    {
      alunoId: 'ALU004',
      alunoNome: 'Ana Costa',
      turma: '2º Ano',
      provaId: 'PROVA002',
      nota: 6.5,
      dataRealizacao: '2023-10-20',
      respostas: Array(8).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.35 }))
    },
    {
      alunoId: 'ALU005',
      alunoNome: 'Rafael Souza',
      turma: '2º Ano',
      provaId: 'PROVA003',
      nota: 8.0,
      dataRealizacao: '2023-11-05',
      respostas: Array(12).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.25 }))
    },
    {
      alunoId: 'ALU006',
      alunoNome: 'Juliana Almeida',
      turma: '1º Ano',
      provaId: 'PROVA003',
      nota: 4.5,
      dataRealizacao: '2023-11-05',
      respostas: Array(12).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.55 }))
    }
  ];
  
  // Adicionar mais dados simulados
  const novosResultados = [
    {
      alunoId: 'ALU007',
      alunoNome: 'Sofia Rodrigues',
      turma: '1º Ano',
      provaId: 'PROVA001',
      nota: 9.5,
      dataRealizacao: '2023-10-16',
      respostas: Array(10).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.2 }))
    },
    {
      alunoId: 'ALU008',
      alunoNome: 'Miguel Pereira',
      turma: '1º Ano',
      provaId: 'PROVA001',
      nota: 6.0,
      dataRealizacao: '2023-10-16',
      respostas: Array(10).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.4 }))
    },
    {
      alunoId: 'ALU009',
      alunoNome: 'Beatriz Lima',
      turma: '2º Ano',
      provaId: 'PROVA002',
      nota: 8.5,
      dataRealizacao: '2023-10-21',
      respostas: Array(8).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.15 }))
    },
    {
      alunoId: 'ALU010',
      alunoNome: 'Lucas Ferreira',
      turma: '2º Ano',
      provaId: 'PROVA002',
      nota: 7.5,
      dataRealizacao: '2023-10-21',
      respostas: Array(8).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.25 }))
    },
    {
      alunoId: 'ALU011',
      alunoNome: 'Mariana Costa',
      turma: '2º Ano',
      provaId: 'PROVA003',
      nota: 9.0,
      dataRealizacao: '2023-11-06',
      respostas: Array(12).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.1 }))
    },
    {
      alunoId: 'ALU012',
      alunoNome: 'Guilherme Santos',
      turma: '1º Ano',
      provaId: 'PROVA003',
      nota: 5.5,
      dataRealizacao: '2023-11-06',
      respostas: Array(12).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.5 }))
    }
  ];
  
  return {
    provas: provas,
    resultados: [...resultados, ...novosResultados]
  };
}

// Carregar opções de provas no filtro
async function carregarFiltroProvas() {
  try {
    // Limpar opções existentes (exceto a primeira)
    while (provaFilter.options.length > 1) {
      provaFilter.remove(1);
    }
    
    // Adicionar opções de provas
    dadosSimulados.provas.forEach(prova => {
      const option = document.createElement('option');
      option.value = prova.id;
      option.textContent = prova.titulo;
      provaFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar provas:', error);
  }
}

// Aplicar filtros e atualizar dashboard
function aplicarFiltros() {
  const turmaFiltrada = turmaFilter.value;
  const provaFiltrada = provaFilter.value;
  
  // Filtrar resultados
  let resultadosFiltrados = dadosSimulados.resultados;
  
  if (turmaFiltrada) {
    resultadosFiltrados = resultadosFiltrados.filter(r => r.turma === turmaFiltrada);
  }
  
  if (provaFiltrada) {
    resultadosFiltrados = resultadosFiltrados.filter(r => r.provaId === provaFiltrada);
  }
  
  // Atualizar estatísticas
  atualizarEstatisticas(resultadosFiltrados);
  
  // Atualizar tabela de resultados
  atualizarTabelaResultados(resultadosFiltrados);
  
  // Atualizar gráfico
  atualizarGrafico(resultadosFiltrados);
}

// Atualizar estatísticas gerais
function atualizarEstatisticas(resultados) {
  const totalProvas = new Set(resultados.map(r => r.provaId)).size;
  const totalAlunos = new Set(resultados.map(r => r.alunoId)).size;
  
  let somaNotas = 0;
  resultados.forEach(r => {
    somaNotas += r.nota;
  });
  
  const mediaGeral = resultados.length > 0 ? (somaNotas / resultados.length).toFixed(1) : '0.0';
  
  // Atualizar elementos DOM
  totalProvasEl.textContent = totalProvas;
  mediaGeralEl.textContent = mediaGeral;
  totalAlunosEl.textContent = totalAlunos;
}

// Atualizar tabela de resultados
async function atualizarTabelaResultados(resultados) {
  // Limpar tabela
  resultsTableBody.innerHTML = '';
  
  // Adicionar linhas para cada resultado
  for (const resultado of resultados) {
    try {
      // Buscar informações da prova
      let prova = dadosSimulados.provas.find(p => p.id === resultado.provaId);
      
      if (!prova) {
        // Se não encontrou nos dados simulados, tenta buscar da API
        try {
          const response = await fetch(`${API_URL}/api/provas/${resultado.provaId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': getToken()
            }
          });
          
          if (response.ok) {
            const provaResponse = await response.json();
            prova = provaResponse.data;
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes da prova:', error);
        }
      }
      
      const row = document.createElement('tr');
      
      // Aluno
      const tdAluno = document.createElement('td');
      tdAluno.textContent = resultado.alunoNome;
      row.appendChild(tdAluno);
      
      // Turma
      const tdTurma = document.createElement('td');
      tdTurma.textContent = resultado.turma;
      row.appendChild(tdTurma);
      
      // Prova
      const tdProva = document.createElement('td');
      tdProva.textContent = prova ? prova.titulo : resultado.provaId;
      row.appendChild(tdProva);
      
      // Nota
      const tdNota = document.createElement('td');
      tdNota.textContent = resultado.nota.toFixed(1);
      // Adicionar classe para colorir com base na nota
      if (resultado.nota >= 7) {
        tdNota.classList.add('nota-aprovado');
      } else if (resultado.nota >= 5) {
        tdNota.classList.add('nota-recuperacao');
      } else {
        tdNota.classList.add('nota-reprovado');
      }
      row.appendChild(tdNota);
      
      // Data
      const tdData = document.createElement('td');
      const data = new Date(resultado.dataRealizacao);
      tdData.textContent = data.toLocaleDateString('pt-BR');
      row.appendChild(tdData);
      
      // Ações
      const tdAcoes = document.createElement('td');
      const btnDetalhes = document.createElement('button');
      btnDetalhes.textContent = 'Detalhes';
      btnDetalhes.classList.add('btn-small');
      btnDetalhes.addEventListener('click', () => mostrarDetalhesProva(resultado));
      tdAcoes.appendChild(btnDetalhes);
      row.appendChild(tdAcoes);
      
      resultsTableBody.appendChild(row);
    } catch (error) {
      console.error('Erro ao processar resultado:', error);
    }
  }
  
  // Mensagem se não houver resultados
  if (resultados.length === 0) {
    const row = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Nenhum resultado encontrado para os filtros selecionados.';
    td.style.textAlign = 'center';
    row.appendChild(td);
    resultsTableBody.appendChild(row);
  }
}

// Inicializar todos os gráficos
function inicializarGraficos() {
  inicializarGraficoDesempenho();
  inicializarGraficoEvolucao();
  inicializarGraficoConteudo();
}

// Inicializar gráfico de desempenho por turma
function inicializarGraficoDesempenho() {
  const ctx = document.getElementById('desempenhoChart').getContext('2d');
  
  // Adicionar controles para o tipo de gráfico
  const chartControls = document.createElement('div');
  chartControls.className = 'chart-controls';
  chartControls.innerHTML = `
    <div class="chart-type-selector">
      <button class="chart-type-btn active" data-type="bar">Barras</button>
      <button class="chart-type-btn" data-type="line">Linhas</button>
      <button class="chart-type-btn" data-type="pie">Pizza</button>
    </div>
    <div class="chart-view-selector">
      <button class="chart-view-btn active" data-view="media">Média</button>
      <button class="chart-view-btn" data-view="distribuicao">Distribuição</button>
    </div>
  `;
  
  const chartCards = document.querySelectorAll('.chart-card');
  chartCards[0].insertBefore(chartControls, document.getElementById('desempenhoChart'));
  
  // Configurar o gráfico inicial
  desempenhoChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Média das Notas',
        data: [],
        backgroundColor: 'rgba(0, 32, 242, 0.7)',
        borderColor: 'rgba(0, 32, 242, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Média: ${context.raw}`;
            }
          }
        },
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: false,
          text: 'Desempenho por Turma'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          title: {
            display: true,
            text: 'Nota Média'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Turmas'
          }
        }
      }
    }
  });

  // Adicionar event listeners para os botões de tipo de gráfico
  document.querySelectorAll('.chart-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      chartType = btn.getAttribute('data-type'); // Atualizar a variável global chartType
      mudarTipoGrafico(chartType);
    });
  });
  
  // Adicionar event listeners para os botões de visualização
  document.querySelectorAll('.chart-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const newViewType = btn.getAttribute('data-view');
      mudarVisualizacaoGrafico(newViewType);
    });
  });
}

// Inicializar gráfico de evolução temporal
function inicializarGraficoEvolucao() {
  const ctx = document.getElementById('evolucaoChart').getContext('2d');
  
  // Configurar o gráfico de evolução temporal
  evolucaoChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Evolução da Média',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Média: ${context.raw}`;
            }
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          title: {
            display: true,
            text: 'Média das Notas'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Data de Aplicação'
          }
        }
      }
    }
  });
}

// Inicializar gráfico de desempenho por conteúdo
function inicializarGraficoConteudo() {
  const ctx = document.getElementById('conteudoChart').getContext('2d');
  
  // Configurar o gráfico de desempenho por conteúdo
  conteudoChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Inglês'],
      datasets: [{
        label: 'Desempenho por Conteúdo',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 2
          }
        }
      }
    }
  });
}

// Função para mudar o tipo de visualização do gráfico
function mudarVisualizacaoGrafico(novoTipo) {
  // Atualizar variável global viewType
  viewType = novoTipo;
  
  // Atualizar gráfico com a nova visualização
  aplicarFiltros();
}

// Função para mudar o tipo de gráfico (bar, line, pie)
function mudarTipoGrafico(novoTipo) {
  if (!desempenhoChart) return;
  
  // Salvar dados atuais
  const data = desempenhoChart.data;
  
  // Destruir gráfico atual
  desempenhoChart.destroy();
  
  // Criar novo gráfico com o tipo desejado
  const ctx = document.getElementById('desempenhoChart').getContext('2d');
  desempenhoChart = new Chart(ctx, {
    type: novoTipo,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}`;
            }
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: novoTipo !== 'pie' ? {
          beginAtZero: true,
          max: 10,
          title: {
            display: true,
            text: viewType === 'media' ? 'Nota Média' : 'Distribuição (0-10)'
          }
        } : undefined,
        x: novoTipo !== 'pie' ? {
          title: {
            display: true,
            text: 'Turmas'
          }
        } : undefined
      }
    }
  });
}

// Função para filtrar resultados por aluno
function filtrarPorAluno() {
  const filtro = alunoFilter.value.toLowerCase();
  const rows = resultsTableBody.querySelectorAll('tr');
  
  rows.forEach(row => {
    const aluno = row.querySelector('td');
    if (!aluno) return;
    
    const nomeAluno = aluno.textContent.toLowerCase();
    if (nomeAluno.includes(filtro)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Função para verificar alunos com baixo desempenho
function verificarAlunosBaixoDesempenho() {
  // Limpar lista anterior
  alunosComBaixoDesempenho = [];
  
  // Agrupar resultados por aluno
  const alunosMap = {};
  
  dadosSimulados.resultados.forEach(resultado => {
    if (!alunosMap[resultado.alunoId]) {
      alunosMap[resultado.alunoId] = {
        id: resultado.alunoId,
        nome: resultado.alunoNome,
        turma: resultado.turma,
        notas: [],
        media: 0
      };
    }
    
    alunosMap[resultado.alunoId].notas.push(resultado.nota);
  });
  
  // Calcular média de cada aluno
  for (const alunoId in alunosMap) {
    const aluno = alunosMap[alunoId];
    const somaNotas = aluno.notas.reduce((soma, nota) => soma + nota, 0);
    aluno.media = somaNotas / aluno.notas.length;
    
    // Verificar se o aluno tem baixo desempenho (média < 6)
    if (aluno.media < 6) {
      alunosComBaixoDesempenho.push(aluno);
    }
  }
  
  // Mostrar alertas para alunos com baixo desempenho
  if (alunosComBaixoDesempenho.length > 0) {
    const alertaContainer = document.createElement('div');
    alertaContainer.className = 'alerta-container';
    alertaContainer.innerHTML = `
      <div class="alerta-header">
        <h3>Alerta: ${alunosComBaixoDesempenho.length} aluno(s) com baixo desempenho</h3>
        <button class="btn-fechar-alerta">&times;</button>
      </div>
      <div class="alerta-content">
        <p>Os seguintes alunos estão com média abaixo de 6:</p>
        <ul class="alerta-lista">
          ${alunosComBaixoDesempenho.map(aluno => `
            <li>
              <strong>${aluno.nome}</strong> (${aluno.turma}) - Média: ${aluno.media.toFixed(1)}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    
    document.querySelector('.dashboard-container').appendChild(alertaContainer);
    
    // Adicionar evento para fechar o alerta
    alertaContainer.querySelector('.btn-fechar-alerta').addEventListener('click', () => {
      alertaContainer.remove();
    });
  }
}

// Função para mostrar detalhes da prova
function mostrarDetalhesProva(resultado) {
  // Limpar conteúdo anterior
  provaDetalhes.innerHTML = '';
  
  // Buscar informações da prova
  const prova = dadosSimulados.provas.find(p => p.id === resultado.provaId);
  
  // Criar conteúdo do modal
  const conteudo = document.createElement('div');
  conteudo.className = 'detalhes-prova';
  
  // Informações do aluno e da prova
  const infoProva = document.createElement('div');
  infoProva.className = 'info-prova';
  infoProva.innerHTML = `
    <p><strong>Aluno:</strong> ${resultado.alunoNome}</p>
    <p><strong>Turma:</strong> ${resultado.turma}</p>
    <p><strong>Prova:</strong> ${prova ? prova.titulo : resultado.provaId}</p>
    <p><strong>Data:</strong> ${new Date(resultado.dataRealizacao).toLocaleDateString('pt-BR')}</p>
    <p><strong>Nota:</strong> <span class="${resultado.nota >= 7 ? 'nota-aprovado' : resultado.nota >= 5 ? 'nota-recuperacao' : 'nota-reprovado'}">${resultado.nota.toFixed(1)}</span></p>
  `;
  conteudo.appendChild(infoProva);
  
  // Respostas do aluno
  if (resultado.respostas && resultado.respostas.length > 0) {
    const respostasContainer = document.createElement('div');
    respostasContainer.className = 'respostas-container';
    respostasContainer.innerHTML = '<h3>Respostas</h3>';
    
    const respostasLista = document.createElement('ul');
    respostasLista.className = 'respostas-lista';
    
    resultado.respostas.forEach(resposta => {
      const item = document.createElement('li');
      item.className = resposta.correta ? 'resposta-correta' : 'resposta-incorreta';
      item.innerHTML = `
        <span class="questao-numero">Questão ${resposta.questao}</span>
        <span class="questao-status">${resposta.correta ? 'Correta' : 'Incorreta'}</span>
      `;
      respostasLista.appendChild(item);
    });
    
    respostasContainer.appendChild(respostasLista);
    conteudo.appendChild(respostasContainer);
    
    // Estatísticas
    const totalQuestoes = resultado.respostas.length;
    const acertos = resultado.respostas.filter(r => r.correta).length;
    const erros = totalQuestoes - acertos;
    const percentualAcerto = (acertos / totalQuestoes) * 100;
    
    const estatisticas = document.createElement('div');
    estatisticas.className = 'estatisticas';
    estatisticas.innerHTML = `
      <h3>Estatísticas</h3>
      <p><strong>Total de questões:</strong> ${totalQuestoes}</p>
      <p><strong>Acertos:</strong> ${acertos} (${percentualAcerto.toFixed(1)}%)</p>
      <p><strong>Erros:</strong> ${erros} (${(100 - percentualAcerto).toFixed(1)}%)</p>
    `;
    conteudo.appendChild(estatisticas);
  }
  
  provaDetalhes.appendChild(conteudo);
  
  // Mostrar modal
  modalDetalhes.style.display = 'flex';
}

// Função para fechar o modal
function fecharModal() {
  modalDetalhes.style.display = 'none';
}

// Função para exportar relatório geral
function exportarRelatorio() {
  // Obter dados filtrados
  const turmaFiltrada = turmaFilter.value;
  const provaFiltrada = provaFilter.value;
  
  // Filtrar resultados
  let resultadosFiltrados = dadosSimulados.resultados;
  
  if (turmaFiltrada) {
    resultadosFiltrados = resultadosFiltrados.filter(r => r.turma === turmaFiltrada);
  }
  
  if (provaFiltrada) {
    resultadosFiltrados = resultadosFiltrados.filter(r => r.provaId === provaFiltrada);
  }
  
  // Criar conteúdo do relatório
  let conteudoCSV = 'Aluno,Turma,Prova,Nota,Data\n';
  
  resultadosFiltrados.forEach(resultado => {
    const prova = dadosSimulados.provas.find(p => p.id === resultado.provaId);
    const tituloProva = prova ? prova.titulo : resultado.provaId;
    const data = new Date(resultado.dataRealizacao).toLocaleDateString('pt-BR');
    
    conteudoCSV += `"${resultado.alunoNome}","${resultado.turma}","${tituloProva}",${resultado.nota.toFixed(1)},"${data}"\n`;
  });
  
  // Criar blob e link para download
  const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'relatorio_desempenho.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Função para exportar detalhes de um aluno específico
function exportarDetalhes() {
  const filtro = alunoFilter.value.toLowerCase();
  let resultadosFiltrados = dadosSimulados.resultados;
  
  if (filtro) {
    resultadosFiltrados = resultadosFiltrados.filter(r => 
      r.alunoNome.toLowerCase().includes(filtro)
    );
  }
  
  // Criar conteúdo do relatório detalhado
  let conteudoCSV = 'Aluno,Turma,Prova,Nota,Data,Acertos,Total Questões,Percentual Acerto\n';
  
  resultadosFiltrados.forEach(resultado => {
    const prova = dadosSimulados.provas.find(p => p.id === resultado.provaId);
    const tituloProva = prova ? prova.titulo : resultado.provaId;
    const data = new Date(resultado.dataRealizacao).toLocaleDateString('pt-BR');
    
    // Calcular estatísticas
    const totalQuestoes = resultado.respostas ? resultado.respostas.length : 0;
    const acertos = resultado.respostas ? resultado.respostas.filter(r => r.correta).length : 0;
    const percentualAcerto = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0;
    
    conteudoCSV += `"${resultado.alunoNome}","${resultado.turma}","${tituloProva}",${resultado.nota.toFixed(1)},"${data}",${acertos},${totalQuestoes},${percentualAcerto.toFixed(1)}\n`;
  });
  
  // Criar blob e link para download
  const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'detalhes_alunos.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Atualizar todos os gráficos com dados filtrados
function atualizarGrafico(resultados) {
  atualizarGraficoDesempenho(resultados);
  atualizarGraficoEvolucao(resultados);
  atualizarGraficoConteudo(resultados);
  atualizarTaxaAprovacao(resultados);
}

// Atualizar gráfico de desempenho por turma
function atualizarGraficoDesempenho(resultados) {
  // Verificar se o gráfico foi inicializado
  if (!desempenhoChart) {
    console.error('O gráfico de desempenho não foi inicializado corretamente');
    return; // Sair da função se o gráfico não estiver inicializado
  }

  // Verificar se resultados é válido
  if (!resultados || !Array.isArray(resultados)) {
    console.error('Dados de resultados inválidos');
    // Fornecer dados padrão para evitar erros
    resultados = [];
  }

  // Agrupar resultados por turma
  const turmas = {};
  
  resultados.forEach(resultado => {
    if (!turmas[resultado.turma]) {
      turmas[resultado.turma] = {
        somaNotas: 0,
        quantidade: 0,
        aprovados: 0,
        recuperacao: 0,
        reprovados: 0,
        notas: [] // Armazenar todas as notas para cálculos estatísticos
      };
    }
    
    turmas[resultado.turma].somaNotas += resultado.nota;
    turmas[resultado.turma].quantidade += 1;
    turmas[resultado.turma].notas.push(resultado.nota);
    
    // Classificar por faixa de nota
    if (resultado.nota >= 7) {
      turmas[resultado.turma].aprovados += 1;
    } else if (resultado.nota >= 5) {
      turmas[resultado.turma].recuperacao += 1;
    } else {
      turmas[resultado.turma].reprovados += 1;
    }
  });
  
  // Calcular médias e outros dados por turma
  const turmasLabels = [];
  const turmasMedias = [];
  const turmasAprovados = [];
  const turmasRecuperacao = [];
  const turmasReprovados = [];
  
  for (const turma in turmas) {
    turmasLabels.push(turma);
    const media = turmas[turma].somaNotas / turmas[turma].quantidade;
    turmasMedias.push(parseFloat(media.toFixed(1)));
    
    // Calcular percentuais para o gráfico de distribuição
    const total = turmas[turma].quantidade;
    turmasAprovados.push((turmas[turma].aprovados / total) * 10); // Multiplicar por 10 para escala de 0-10
    turmasRecuperacao.push((turmas[turma].recuperacao / total) * 10);
    turmasReprovados.push((turmas[turma].reprovados / total) * 10);
  }
  
  // Verificar qual visualização está ativa
  const activeViewBtn = document.querySelector('.chart-view-btn.active');
  const currentViewType = activeViewBtn ? activeViewBtn.getAttribute('data-view') : 'media'; // 'media' como padrão
  
  // Verificar se o gráfico tem a propriedade data
  if (!desempenhoChart.data) {
    console.error('O objeto do gráfico não possui a propriedade data');
    // Inicializar a propriedade data
    desempenhoChart.data = {
      labels: [],
      datasets: []
    };
  }

  // Verificar se o gráfico tem a propriedade options
  if (!desempenhoChart.options) {
    console.error('O objeto do gráfico não possui a propriedade options');
    // Inicializar a propriedade options
    desempenhoChart.options = {
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          title: {
            display: true,
            text: 'Nota Média'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Turmas'
          }
        }
      }
    };
  }

  // Atualizar labels do gráfico
  desempenhoChart.data.labels = turmasLabels;

  if (currentViewType === 'media') {
    // Visualização de média
    desempenhoChart.data.datasets = [{
      label: 'Média das Notas',
      data: turmasMedias,
      backgroundColor: 'rgba(0, 32, 242, 0.7)',
      borderColor: 'rgba(0, 32, 242, 1)',
      borderWidth: 1
    }];
    
    // Verificar se options.scales.y existe antes de acessar
    if (desempenhoChart.options.scales && desempenhoChart.options.scales.y && desempenhoChart.options.scales.y.title) {
      desempenhoChart.options.scales.y.title.text = 'Nota Média';
    }
  } else {
    // Visualização de distribuição
    desempenhoChart.data.datasets = [
      {
        label: 'Aprovados (≥7)',
        data: turmasAprovados,
        backgroundColor: 'rgba(40, 167, 69, 0.7)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1
      },
      {
        label: 'Recuperação (5-6.9)',
        data: turmasRecuperacao,
        backgroundColor: 'rgba(255, 193, 7, 0.7)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1
      },
      {
        label: 'Reprovados (<5)',
        data: turmasReprovados,
        backgroundColor: 'rgba(220, 53, 69, 0.7)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1
      }
    ];
    
    // Verificar se options.scales.y existe antes de acessar
    if (desempenhoChart.options.scales && desempenhoChart.options.scales.y && desempenhoChart.options.scales.y.title) {
      desempenhoChart.options.scales.y.title.text = 'Distribuição (0-10)';
    }
  }

  // Atualizar tipo de gráfico se necessário
  if (desempenhoChart.config.type !== chartType) {
    mudarTipoGrafico(chartType);
  } else {
    desempenhoChart.update();
  }
}

// Atualizar gráfico de evolução temporal
function atualizarGraficoEvolucao(resultados) {
  // Verificar se o gráfico foi inicializado
  if (!evolucaoChart) {
    console.error('O gráfico de evolução não foi inicializado corretamente');
    return;
  }

  // Verificar se resultados é válido
  if (!resultados || !Array.isArray(resultados)) {
    resultados = [];
  }

  // Agrupar resultados por data
  const dataMap = {};
  
  // Ordenar resultados por data
  resultados.sort((a, b) => new Date(a.dataRealizacao) - new Date(b.dataRealizacao));
  
  resultados.forEach(resultado => {
    // Formatar data para exibição (apenas mês e dia)
    const data = new Date(resultado.dataRealizacao);
    const dataFormatada = `${data.getDate()}/${data.getMonth() + 1}`;
    
    if (!dataMap[dataFormatada]) {
      dataMap[dataFormatada] = {
        somaNotas: 0,
        quantidade: 0
      };
    }
    
    dataMap[dataFormatada].somaNotas += resultado.nota;
    dataMap[dataFormatada].quantidade += 1;
  });
  
  // Preparar dados para o gráfico
  const datas = [];
  const medias = [];
  
  for (const data in dataMap) {
    datas.push(data);
    const media = dataMap[data].somaNotas / dataMap[data].quantidade;
    medias.push(parseFloat(media.toFixed(1)));
  }
  
  // Atualizar dados do gráfico
  evolucaoChart.data.labels = datas;
  evolucaoChart.data.datasets[0].data = medias;
  
  // Atualizar gráfico
  evolucaoChart.update();
}

// Atualizar gráfico de desempenho por conteúdo
function atualizarGraficoConteudo(resultados) {
  // Verificar se o gráfico foi inicializado
  if (!conteudoChart) {
    console.error('O gráfico de conteúdo não foi inicializado corretamente');
    return;
  }

  // Verificar se resultados é válido
  if (!resultados || !Array.isArray(resultados)) {
    resultados = [];
  }

  // Dados simulados de desempenho por conteúdo
  // Em um ambiente real, isso viria da API com dados reais
  const conteudos = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Inglês'];
  const desempenhoConteudo = [];
  
  // Gerar dados simulados para cada conteúdo
  conteudos.forEach(() => {
    // Calcular média aleatória entre 5 e 9 para simular desempenho
    const mediaConteudo = resultados.length > 0 ? 
      5 + Math.random() * 4 : 0;
    desempenhoConteudo.push(parseFloat(mediaConteudo.toFixed(1)));
  });
  
  // Atualizar dados do gráfico
  conteudoChart.data.labels = conteudos;
  conteudoChart.data.datasets[0].data = desempenhoConteudo;
  
  // Atualizar gráfico
  conteudoChart.update();
}

// Atualizar taxa de aprovação
function atualizarTaxaAprovacao(resultados) {
  if (!resultados || !Array.isArray(resultados) || resultados.length === 0) {
    taxaAprovacaoEl.textContent = '0%';
    return;
  }
  
  // Contar aprovados (nota >= 7)
  const aprovados = resultados.filter(r => r.nota >= 7).length;
  const total = resultados.length;
  
  // Calcular taxa de aprovação
  const taxa = (aprovados / total) * 100;
  
  // Atualizar elemento DOM
  taxaAprovacaoEl.textContent = `${taxa.toFixed(1)}%`;
}

// Atualizar visualização do gráfico de desempenho
function atualizarVisualizacaoGrafico() {
  if (viewType === 'distribuicao') {
    desempenhoChart.options.scales.y.title.text = 'Distribuição (escala 0-10)';
  }
  }
  
  // Atualizar dados do gráfico
  desempenhoChart.data.labels = turmasLabels;
  
  // Configurações específicas para gráfico de pizza
  if (chartType === 'pie' || chartType === 'doughnut') {
    // Ajustar opções para gráfico de pizza
    desempenhoChart.options.scales = {}; // Remover escalas para gráficos de pizza
    
    // Configurar cores mais vibrantes para pizza
    if (viewType === 'media') {
      // Para visualização de média, usamos cores diferentes para cada turma
      const backgroundColors = [
        'rgba(0, 32, 242, 0.7)',   // Azul
        'rgba(40, 167, 69, 0.7)',  // Verde
        'rgba(255, 193, 7, 0.7)',   // Amarelo
        'rgba(220, 53, 69, 0.7)',   // Vermelho
        'rgba(153, 102, 255, 0.7)', // Roxo
        'rgba(255, 159, 64, 0.7)'   // Laranja
      ];
      
      desempenhoChart.data.datasets[0].backgroundColor = backgroundColors.slice(0, turmasLabels.length);
    }
  } else {
    // Restaurar escalas para outros tipos de gráficos
    desempenhoChart.options.scales = {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: viewType === 'media' ? 'Nota Média' : 'Distribuição (escala 0-10)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Turmas'
        }
      }
    };
  }
  
  desempenhoChart.update();

// Mostrar detalhes da prova em um modal
async function mostrarDetalhesProva(resultado) {
  if (!resultado) {
    console.error('Erro: Resultado não fornecido');
    return;
  }

  try {
    // Buscar informações da prova
    let prova = dadosSimulados.provas.find(p => p.id === resultado.provaId);
    
    if (!prova) {
      // Se não encontrou nos dados simulados, tenta buscar da API
      try {
        const response = await fetch(`${API_URL}/api/provas/${resultado.provaId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': getToken()
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          prova = data.data;
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes da prova:', error);
      }
    }
    
    // Construir conteúdo do modal
    let conteudo = `
      <div class="detalhe-item">
        <strong>Aluno:</strong> ${resultado.alunoNome}
      </div>
      <div class="detalhe-item">
        <strong>Turma:</strong> ${resultado.turma}
      </div>
      <div class="detalhe-item">
        <strong>Prova:</strong> ${prova ? prova.titulo : resultado.provaId}
      </div>
      <div class="detalhe-item">
        <strong>Data:</strong> ${new Date(resultado.dataRealizacao).toLocaleDateString('pt-BR')}
      </div>
      <div class="detalhe-item">
        <strong>Nota:</strong> ${resultado.nota.toFixed(1)}
      </div>
      <div class="detalhe-item">
        <strong>Questões:</strong>
        <table class="questoes-table">
          <thead>
            <tr>
              <th>Questão</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Adicionar linhas para cada questão
    resultado.respostas.forEach(resposta => {
      conteudo += `
        <tr>
          <td>Questão ${resposta.questao}</td>
          <td class="${resposta.correta ? 'resposta-correta' : 'resposta-incorreta'}">
            ${resposta.correta ? 'Correta' : 'Incorreta'}
          </td>
        </tr>
      `;
    });
    
    conteudo += `
          </tbody>
        </table>
      </div>
    `;
    
    // Atualizar conteúdo do modal e exibi-lo
    provaDetalhes.innerHTML = conteudo;
    modalDetalhes.style.display = 'flex';
  } catch (error) {
    console.error('Erro ao mostrar detalhes da prova:', error);
  }
}

// Fechar modal
function fecharModal() {
  modalDetalhes.style.display = 'none';
}

// Exportar relatório (simulado)
async function exportarRelatorio() {
  // Obter dados filtrados
  const turmaFiltrada = turmaFilter.value;
  const provaFiltrada = provaFilter.value;
  let resultadosFiltrados = dadosSimulados.resultados;
  
  if (turmaFiltrada) {
    resultadosFiltrados = resultadosFiltrados.filter(r => r.turma === turmaFiltrada);
  }
  
  if (provaFiltrada) {
    resultadosFiltrados = resultadosFiltrados.filter(r => r.provaId === provaFiltrada);
  }

  // Criar conteúdo do relatório
  let conteudo = 'Relatório de Desempenho\n\n';
  
  // Adicionar informações do filtro
  conteudo += `Turma: ${turmaFiltrada || 'Todas'}\n`;
  conteudo += `Prova: ${provaFiltrada ? dadosSimulados.provas.find(p => p.id === provaFiltrada).titulo : 'Todas'}\n\n`;
  
  // Adicionar estatísticas gerais
  const mediaGeral = resultadosFiltrados.reduce((acc, curr) => acc + curr.nota, 0) / resultadosFiltrados.length;
  conteudo += `Estatísticas Gerais:\n`;
  conteudo += `Total de Provas: ${resultadosFiltrados.length}\n`;
  conteudo += `Média Geral: ${mediaGeral.toFixed(1)}\n`;
  conteudo += `Total de Alunos: ${new Set(resultadosFiltrados.map(r => r.alunoId)).size}\n\n`;
  
  // Adicionar resultados detalhados
  conteudo += 'Resultados Detalhados:\n';
  conteudo += 'Aluno\tTurma\tProva\tNota\tData\n';
  
  for (const resultado of resultadosFiltrados) {
    try {
      const response = await fetch(`${API_URL}/api/provas/${resultado.provaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': getToken()
        }
      });
      
      if (!response.ok) {
        console.error('Erro ao buscar detalhes da prova');
        continue;
      }
      
      const data = await response.json();
      const prova = data.data;
      const dataFormatada = new Date(resultado.dataRealizacao).toLocaleDateString('pt-BR');
      conteudo += `${resultado.alunoNome}\t${resultado.turma}\t${prova.titulo}\t${resultado.nota.toFixed(1)}\t${dataFormatada}\n`;
    } catch (error) {
      console.error('Erro ao processar resultado:', error);
    }
  }
  
  // Criar blob e fazer download
  const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio-desempenho.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Adicionar mais dados fictícios para demonstração
function adicionarDadosFicticios() {
  // Adicionar mais alunos e resultados
  const novosResultados = [
    {
      alunoId: 'ALU007',
      alunoNome: 'Sofia Rodrigues',
      turma: '1º Ano',
      provaId: 'PROVA001',
      nota: 9.5,
      dataRealizacao: '2023-10-16',
      respostas: Array(10).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.2 }))
    },
    {
      alunoId: 'ALU008',
      alunoNome: 'Miguel Pereira',
      turma: '1º Ano',
      provaId: 'PROVA001',
      nota: 6.0,
      dataRealizacao: '2023-10-16',
      respostas: Array(10).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.4 }))
    },
    {
      alunoId: 'ALU009',
      alunoNome: 'Beatriz Lima',
      turma: '2º Ano',
      provaId: 'PROVA002',
      nota: 8.5,
      dataRealizacao: '2023-10-21',
      respostas: Array(8).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.15 }))
    },
    {
      alunoId: 'ALU010',
      alunoNome: 'Lucas Ferreira',
      turma: '2º Ano',
      provaId: 'PROVA002',
      nota: 7.5,
      dataRealizacao: '2023-10-21',
      respostas: Array(8).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.25 }))
    },
    {
      alunoId: 'ALU011',
      alunoNome: 'Mariana Costa',
      turma: '2º Ano',
      provaId: 'PROVA003',
      nota: 9.0,
      dataRealizacao: '2023-11-06',
      respostas: Array(12).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.1 }))
    },
    {
      alunoId: 'ALU012',
      alunoNome: 'Guilherme Santos',
      turma: '1º Ano',
      provaId: 'PROVA003',
      nota: 5.5,
      dataRealizacao: '2023-11-06',
      respostas: Array(12).fill().map((_, i) => ({ questao: i+1, correta: Math.random() > 0.5 }))
    }
  ];
  
  // Adicionar ao array de resultados
  dadosSimulados.resultados = [...dadosSimulados.resultados, ...novosResultados];
}

// Chamar função para adicionar dados fictícios
adicionarDadosFicticios();

// Função para mudar o tipo de gráfico
function mudarTipoGrafico(tipo) {
  if (desempenhoChart.config.type === tipo) return;
  
  // Salvar dados atuais
  const labels = desempenhoChart.data.labels;
  const datasets = desempenhoChart.data.datasets;
  
  // Destruir gráfico atual
  desempenhoChart.destroy();
  
  // Criar novo gráfico com o tipo selecionado
  const ctx = document.getElementById('desempenhoChart').getContext('2d');
  
  // Configurações específicas para cada tipo de gráfico
  let options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {}
      },
      legend: {
        display: true,
        position: 'top'
      }
    }
  };
  
  // Atualizar variável global chartType
  chartType = tipo;
  
  if (tipo === 'pie' || tipo === 'doughnut') {
    // Configurações específicas para gráficos de pizza
    options.plugins.tooltip.callbacks.label = function(context) {
      return `${context.label}: ${context.raw}`;
    };
    
    // Para gráficos de pizza, precisamos ajustar os datasets
    if (viewType === 'media') {
      // Cores para cada turma
      const backgroundColors = [
        'rgba(0, 32, 242, 0.7)',   // Azul
        'rgba(40, 167, 69, 0.7)',  // Verde
        'rgba(255, 193, 7, 0.7)',   // Amarelo
        'rgba(220, 53, 69, 0.7)',   // Vermelho
        'rgba(153, 102, 255, 0.7)', // Roxo
        'rgba(255, 159, 64, 0.7)'   // Laranja
      ];
      
      datasets[0].backgroundColor = backgroundColors.slice(0, labels.length);
    }
  } else {
    // Configurações para gráficos de barras e linhas
    options.scales = {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: viewType === 'media' ? 'Nota Média' : 'Distribuição (escala 0-10)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Turmas'
        }
      }
    };
    
    // Restaurar cores padrão para gráficos de barras/linhas
    if (viewType === 'media') {
      datasets[0].backgroundColor = 'rgba(0, 32, 242, 0.7)';
      datasets[0].borderColor = 'rgba(0, 32, 242, 1)';
    }
  }
  
  // Criar novo gráfico
  try {
    if (desempenhoChart) {
      desempenhoChart.destroy();
    }
    desempenhoChart = new Chart(ctx, {
      type: tipo,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: options
    });
  } catch (error) {
    console.error('Erro ao criar gráfico:', error);
    // Recriar gráfico vazio para evitar quebras na interface
    desempenhoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Erro ao carregar dados',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}




// Adicionar estilos CSS para as notas, respostas e controles do gráfico
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .nota-aprovado { color: #28a745; font-weight: bold; }
    .nota-recuperacao { color: #ffc107; font-weight: bold; }
    .nota-reprovado { color: #dc3545; font-weight: bold; }
    .resposta-correta { color: #28a745; }
    .resposta-incorreta { color: #dc3545; }
    .questoes-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .questoes-table th, .questoes-table td { padding: 8px; border-bottom: 1px solid #eee; }
    .detalhe-item { margin-bottom: 15px; }
    
    /* Estilos para controles do gráfico */
    .chart-controls {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    .chart-type-selector, .chart-view-selector {
      display: flex;
      gap: 5px;
    }
    .chart-type-btn, .chart-view-btn {
      padding: 5px 10px;
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }
    .chart-type-btn:hover, .chart-view-btn:hover {
      background-color: #e0e0e0;
    }
    .chart-type-btn.active, .chart-view-btn.active {
      background-color: #0020f2;
      color: white;
      border-color: #0020f2;
    }
    .chart-card {
      position: relative;
      min-height: 350px;
    }
    canvas#desempenhoChart {
      min-height: 250px;
    }
  `;
  document.head.appendChild(style);
});