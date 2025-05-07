/**
 * Dashboard Integrado
 * Implementação do dashboard que integra dados das APIs EducaSmart e Quest
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Verificação de autenticação
  if (!API_CONFIG.isProfessorLoggedIn()) {
    window.location.href = '/pages/login-professor.html';
    return;
  }
  console.log('Professor autenticado, carregando dashboard...');

  // Elementos do DOM
  const turmaFilter = document.getElementById('turmaFilter');
  const disciplinaFilter = document.getElementById('disciplinaFilter');
  const provaFilter = document.getElementById('provaFilter');
  const periodoFilter = document.getElementById('periodoFilter');
  const alunoFilter = document.getElementById('alunoFilter');
  const alunoSearchFilter = document.getElementById('alunoSearchFilter');
  const btnExportar = document.getElementById('btnExportar');
  const btnExportarDetalhes = document.getElementById('btnExportarDetalhes');
  const resultsTableBody = document.getElementById('resultsTableBody');
  const questoesRecomendadas = document.getElementById('questoesRecomendadas');
  const questoesDificeisTableBody = document.getElementById('questoesDificeisTableBody');
  const alunosTableBody = document.getElementById('alunosTableBody');

  // Estatísticas
  const totalProvasElement = document.getElementById('totalProvas');
  const mediaGeralElement = document.getElementById('mediaGeral');
  const totalAlunosElement = document.getElementById('totalAlunos');
  const taxaAprovacaoElement = document.getElementById('taxaAprovacao');

  // Abas
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Gráficos
  let desempenhoChart;
  let questoesDisciplinaChart;
  let conteudoChart;
  let dificuldadeChart;
  let evolucaoTemporalChart;
  let distribuicaoNotasChart;
  let mediaTurmaChart;
  let mediaPorConteudoChart;
  let comparativoTurmasChart;
  let alternativasChart;
  let evolucaoAlunoChart;

  // Dados do dashboard
  let dashboardData = null;
  let filteredData = null;
  let alunoSelecionado = null;

  // Inicializar sistema de abas
  function inicializarAbas() {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remover classe ativa de todos os botões
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Adicionar classe ativa ao botão clicado
        this.classList.add('active');
        
        // Obter o id da aba a ser mostrada
        const tabId = this.getAttribute('data-tab');
        
        // Esconder todas as abas
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Mostrar a aba correspondente
        document.getElementById(`${tabId}-tab`).classList.add('active');
      });
    });
  }

  // Carregar dados do dashboard
  async function carregarDados() {
    try {
      // Mostrar indicador de carregamento
      exibirCarregando(true);

      // Obter dados do serviço de dashboard
      dashboardData = await DashboardService.obterDadosDashboard();
      
      if (!dashboardData) {
        alert('Não foi possível carregar os dados do dashboard. Verifique sua conexão com as APIs EducaSmart e Quest.');
        exibirMensagemSemDados();
        exibirCarregando(false);
        return;
      }

      // Verificar se há dados nas APIs
      if (!dashboardData.provas || dashboardData.provas.length === 0 || 
          !dashboardData.resultados || dashboardData.resultados.length === 0) {
        alert('Não há dados disponíveis nas APIs. Verifique se existem provas e resultados cadastrados.');
        exibirMensagemSemDados();
        exibirCarregando(false);
        return;
      }

      // Aplicar filtros iniciais (sem filtro)
      filteredData = dashboardData;

      // Preencher filtros
      preencherFiltros();

      // Atualizar dashboard
      atualizarDashboard();

      // Inicializar sistema de abas
      inicializarAbas();

      // Esconder indicador de carregamento
      exibirCarregando(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Ocorreu um erro ao carregar os dados. Verifique sua conexão com as APIs EducaSmart e Quest.');
      exibirMensagemSemDados();
      exibirCarregando(false);
    }
  }
  
  // Exibir mensagem quando não há dados disponíveis
  function exibirMensagemSemDados() {
    const containers = document.querySelectorAll('.chart-container, .stats-container, .results-container, .questoes-container');
    containers.forEach(container => {
      container.innerHTML = '<div class="no-data-message"><p>Não há dados disponíveis. Verifique sua conexão com as APIs.</p></div>';
    });
  }

  // Função para exibir/esconder indicador de carregamento
  function exibirCarregando(mostrar) {
    // Implementação simples - pode ser melhorada com um spinner
    document.body.style.cursor = mostrar ? 'wait' : 'default';
  }

  // Preencher filtros com dados disponíveis
  function preencherFiltros() {
    if (!dashboardData) return;

    // Obter valores únicos para os filtros
    const turmas = [...new Set(dashboardData.provas.map(prova => prova.turma))];
    const disciplinas = [...new Set(dashboardData.provas.map(prova => prova.disciplina))];
    const provas = dashboardData.provas.map(prova => ({
      id: prova.id,
      titulo: prova.titulo
    }));

    // Preencher filtro de turmas
    turmas.forEach(turma => {
      if (turma && !turmaFilter.querySelector(`option[value="${turma}"]`)) {
        const option = document.createElement('option');
        option.value = turma;
        option.textContent = turma;
        turmaFilter.appendChild(option);
      }
    });

    // Preencher filtro de disciplinas
    disciplinaFilter.innerHTML = '<option value="">Todas as Disciplinas</option>';
    disciplinas.forEach(disciplina => {
      if (disciplina) {
        const option = document.createElement('option');
        option.value = disciplina;
        option.textContent = disciplina;
        disciplinaFilter.appendChild(option);
      }
    });

    // Preencher filtro de provas
    provaFilter.innerHTML = '<option value="">Todas as Provas</option>';
    provas.forEach(prova => {
      const option = document.createElement('option');
      option.value = prova.id;
      option.textContent = prova.titulo;
      provaFilter.appendChild(option);
    });
  }

  // Atualizar dashboard com dados filtrados
  function atualizarDashboard() {
    if (!filteredData) return;

    // Atualizar estatísticas
    atualizarEstatisticas();

    // Atualizar gráficos básicos
    atualizarGraficosBasicos();

    // Atualizar estatísticas avançadas
    atualizarEstatisticasAvancadas();

    // Atualizar tabela de resultados
    atualizarTabelaResultados();

    // Atualizar questões recomendadas
    atualizarQuestoesRecomendadas();
  }

  // Atualizar estatísticas do dashboard
  function atualizarEstatisticas() {
    // Calcular estatísticas com base nos dados filtrados
    const totalProvas = filteredData.provas.length;
    
    // Calcular média geral das notas
    let somaNotas = 0;
    let totalNotas = 0;
    filteredData.resultados.forEach(resultado => {
      somaNotas += resultado.nota;
      totalNotas++;
    });
    const mediaGeral = totalNotas > 0 ? (somaNotas / totalNotas).toFixed(1) : '0.0';
    
    // Calcular total de alunos únicos
    const alunosUnicos = [...new Set(filteredData.resultados.map(r => r.alunoId))];
    const totalAlunos = alunosUnicos.length;
    
    // Calcular taxa de aprovação (considerando nota >= 6 como aprovação)
    const alunosAprovados = filteredData.resultados.filter(r => r.nota >= 6).length;
    const taxaAprovacao = totalNotas > 0 ? Math.round((alunosAprovados / totalNotas) * 100) : 0;
    
    // Atualizar elementos na interface
    totalProvasElement.textContent = totalProvas;
    mediaGeralElement.textContent = mediaGeral;
    totalAlunosElement.textContent = totalAlunos;
    taxaAprovacaoElement.textContent = `${taxaAprovacao}%`;
  }

  // Atualizar gráficos básicos do dashboard
  function atualizarGraficosBasicos() {
    // Gráfico de desempenho por turma
    atualizarGraficoDesempenho();
    
    // Gráfico de questões por disciplina
    atualizarGraficoQuestoesDisciplina();
    
    // Gráfico de desempenho por conteúdo
    atualizarGraficoConteudo();
    
    // Gráfico de questões por nível de dificuldade
    atualizarGraficoDificuldade();
  }

  // Atualizar gráficos de estatísticas avançadas
  function atualizarEstatisticasAvancadas() {
    // Verificar se temos os dados de estatísticas avançadas
    if (!filteredData.estatisticas || !filteredData.estatisticas.avancadas) {
      console.warn('Dados de estatísticas avançadas não disponíveis');
      return;
    }

    const estatisticasAvancadas = filteredData.estatisticas.avancadas;

    // Atualizar os diferentes gráficos de estatísticas avançadas
    atualizarGraficoEvolucaoTemporal(estatisticasAvancadas);
    atualizarGraficoDistribuicaoNotas(estatisticasAvancadas);
    atualizarGraficoMediaTurma(estatisticasAvancadas);
    atualizarGraficoMediaPorConteudo(estatisticasAvancadas);
    atualizarTabelaQuestoesDificeis(estatisticasAvancadas);
    atualizarTabelaDesempenhoAlunos(estatisticasAvancadas);
    criarMapaCalor(estatisticasAvancadas);
  }

  // Atualizar gráfico de evolução temporal
  function atualizarGraficoEvolucaoTemporal(estatisticasAvancadas) {
    const ctx = document.getElementById('evolucaoTemporalChart').getContext('2d');
    const dados = estatisticasAvancadas.evoluçãoTemporal || [];

    if (dados.length === 0) {
      ctx.canvas.parentNode.innerHTML = '<p class="no-data-message">Não há dados suficientes para mostrar a evolução temporal.</p>';
      return;
    }

    // Preparar dados para o gráfico
    const labels = dados.map(item => item.periodo);
    const valores = dados.map(item => parseFloat(item.media));
    
    const data = {
      labels: labels,
      datasets: [{
        label: 'Média de Acertos (%)',
        data: valores,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    };
    
    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(2) + '%';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Porcentagem de Acertos'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Período'
            }
          }
        }
      }
    };

    // Criar ou atualizar gráfico
    if (evolucaoTemporalChart) {
      evolucaoTemporalChart.data = data;
      evolucaoTemporalChart.update();
    } else {
      evolucaoTemporalChart = new Chart(ctx, config);
    }
  }

  // Atualizar gráfico de distribuição de notas
  function atualizarGraficoDistribuicaoNotas(estatisticasAvancadas) {
    const ctx = document.getElementById('distribuicaoNotasChart').getContext('2d');
    const dados = estatisticasAvancadas.distribuicaoNotas || [];

    if (dados.length === 0) {
      ctx.canvas.parentNode.innerHTML = '<p class="no-data-message">Não há dados suficientes para mostrar a distribuição de notas.</p>';
      return;
    }

    // Preparar dados para o gráfico
    const labels = dados.map(item => item.faixa);
    const valores = dados.map(item => item.quantidade);
    
    const data = {
      labels: labels,
      datasets: [{
        label: 'Quantidade de Alunos',
        data: valores,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)'
        ],
        borderWidth: 1
      }]
    };
    
    const config = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                return `Faixa: ${tooltipItems[0].label}`;
              },
              label: function(context) {
                return `${context.parsed.y} alunos`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantidade de Alunos'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Faixa de Nota'
            }
          }
        }
      }
    };

    // Criar ou atualizar gráfico
    if (distribuicaoNotasChart) {
      distribuicaoNotasChart.data = data;
      distribuicaoNotasChart.update();
    } else {
      distribuicaoNotasChart = new Chart(ctx, config);
    }
  }

  // Atualizar gráfico de média por turma
  function atualizarGraficoMediaTurma(estatisticasAvancadas) {
    const ctx = document.getElementById('mediaTurmaChart').getContext('2d');
    const dados = estatisticasAvancadas.mediaPorTurma || [];

    if (dados.length === 0) {
      ctx.canvas.parentNode.innerHTML = '<p class="no-data-message">Não há dados suficientes para mostrar a média por turma.</p>';
      return;
    }

    // Preparar dados para o gráfico
    const labels = dados.map(item => item.turma);
    const valores = dados.map(item => parseFloat(item.media));
    
    const data = {
      labels: labels,
      datasets: [{
        label: 'Média de Acertos (%)',
        data: valores,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
    
    const config = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                return `Turma: ${tooltipItems[0].label}`;
              },
              label: function(context) {
                return `Média: ${context.parsed.y.toFixed(2)}%`;
              },
              afterLabel: function(context) {
                const turmaIndex = context.dataIndex;
                return `Total de alunos: ${dados[turmaIndex].totalAlunos}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Média de Acertos (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Turma'
            }
          }
        }
      }
    };

    // Criar ou atualizar gráfico
    if (mediaTurmaChart) {
      mediaTurmaChart.data = data;
      mediaTurmaChart.update();
    } else {
      mediaTurmaChart = new Chart(ctx, config);
    }
  }

  // Atualizar gráfico de média por conteúdo
  function atualizarGraficoMediaPorConteudo(estatisticasAvancadas) {
    const ctx = document.getElementById('mediaPorConteudoChart').getContext('2d');
    const dados = estatisticasAvancadas.mediaPorConteudo || [];

    if (dados.length === 0) {
      ctx.canvas.parentNode.innerHTML = '<p class="no-data-message">Não há dados suficientes para mostrar a taxa de acerto por conteúdo.</p>';
      return;
    }

    // Limitar a 10 conteúdos para melhor visualização
    const dadosLimitados = dados.slice(0, 10);

    // Preparar dados para o gráfico
    const labels = dadosLimitados.map(item => item.conteudo);
    const valores = dadosLimitados.map(item => parseFloat(item.taxaAcerto));
    
    const data = {
      labels: labels,
      datasets: [{
        label: 'Taxa de Acerto (%)',
        data: valores,
        backgroundColor: valores.map(valor => {
          // Cores baseadas na taxa de acerto
          if (valor >= 80) return 'rgba(40, 167, 69, 0.7)';
          if (valor >= 60) return 'rgba(92, 184, 92, 0.7)';
          if (valor >= 40) return 'rgba(255, 193, 7, 0.7)';
          if (valor >= 20) return 'rgba(253, 126, 20, 0.7)';
          return 'rgba(220, 53, 69, 0.7)';
        }),
        borderColor: valores.map(valor => {
          if (valor >= 80) return 'rgb(40, 167, 69)';
          if (valor >= 60) return 'rgb(92, 184, 92)';
          if (valor >= 40) return 'rgb(255, 193, 7)';
          if (valor >= 20) return 'rgb(253, 126, 20)';
          return 'rgb(220, 53, 69)';
        }),
        borderWidth: 1
      }]
    };
    
    const config = {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                return `Conteúdo: ${tooltipItems[0].label}`;
              },
              label: function(context) {
                return `Taxa de acerto: ${context.parsed.x.toFixed(2)}%`;
              },
              afterLabel: function(context) {
                const conteudoIndex = context.dataIndex;
                return `Total de respostas: ${dadosLimitados[conteudoIndex].totalRespostas}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Taxa de Acerto (%)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Conteúdo'
            }
          }
        }
      }
    };

    // Criar ou atualizar gráfico
    if (mediaPorConteudoChart) {
      mediaPorConteudoChart.data = data;
      mediaPorConteudoChart.update();
    } else {
      mediaPorConteudoChart = new Chart(ctx, config);
    }
  }

  // Atualizar tabela de questões difíceis
  function atualizarTabelaQuestoesDificeis(estatisticasAvancadas) {
    const tabela = document.getElementById('questoesDificeisTableBody');
    const dados = estatisticasAvancadas.questoesDificeis || [];

    if (dados.length === 0) {
      tabela.innerHTML = '<tr><td colspan="5" class="no-data-message">Não há dados suficientes para mostrar as questões mais difíceis.</td></tr>';
      return;
    }

    // Limpar tabela
    tabela.innerHTML = '';

    // Preencher tabela com as questões mais difíceis
    dados.forEach(questao => {
      const tr = document.createElement('tr');
      
      // Definir classe baseada na taxa de acerto
      if (parseFloat(questao.taxaAcerto) < 30) {
        tr.classList.add('questao-dificil');
      }
      
      tr.innerHTML = `
        <td>${questao.enunciado}</td>
        <td>${questao.disciplina}</td>
        <td>${questao.conteudo}</td>
        <td>${questao.taxaAcerto}%</td>
        <td>${questao.totalRespostas}</td>
      `;
      
      tabela.appendChild(tr);
    });
  }

  // Atualizar tabela de desempenho individual dos alunos
  function atualizarTabelaDesempenhoAlunos(estatisticasAvancadas) {
    const tabela = document.getElementById('alunosTableBody');
    const dados = estatisticasAvancadas.desempenhoIndividual || [];

    if (dados.length === 0) {
      tabela.innerHTML = '<tr><td colspan="5" class="no-data-message">Não há dados suficientes para mostrar o desempenho individual dos alunos.</td></tr>';
      return;
    }

    // Limpar tabela
    tabela.innerHTML = '';

    // Preencher tabela com os alunos
    dados.forEach(aluno => {
      const tr = document.createElement('tr');
      
      // Definir classe baseada na média geral
      const media = parseFloat(aluno.mediaGeral);
      let classeMedia = '';
      
      if (media >= 80) {
        classeMedia = 'nota-aprovado';
      } else if (media >= 60) {
        classeMedia = 'nota-recuperacao';
      } else {
        classeMedia = 'nota-reprovado';
      }
      
      tr.innerHTML = `
        <td>${aluno.nome}</td>
        <td>${aluno.turma}</td>
        <td class="${classeMedia}">${aluno.mediaGeral}%</td>
        <td>${aluno.totalProvas}</td>
        <td>
          <button class="btn-acao" onclick="visualizarEvolucaoAluno('${aluno.id}')">
            Evolução
          </button>
        </td>
      `;
      
      tabela.appendChild(tr);
    });

    // Adicionar evento de pesquisa no filtro de alunos
    const inputPesquisa = document.getElementById('alunoSearchFilter');
    if (inputPesquisa) {
      inputPesquisa.addEventListener('keyup', () => {
        const termo = inputPesquisa.value.toLowerCase();
        const linhas = tabela.querySelectorAll('tr');
        
        linhas.forEach(linha => {
          const nomeAluno = linha.querySelector('td:first-child').textContent.toLowerCase();
          const turmaAluno = linha.querySelector('td:nth-child(2)').textContent.toLowerCase();
          
          if (nomeAluno.includes(termo) || turmaAluno.includes(termo)) {
            linha.style.display = '';
          } else {
            linha.style.display = 'none';
          }
        });
      });
    }
  }

  // Criar mapa de calor de desempenho
  function criarMapaCalor(estatisticasAvancadas) {
    const container = document.getElementById('heatmapContainer');
    const dados = estatisticasAvancadas.evoluçãoTemporal || [];
    
    if (dados.length === 0) {
      container.innerHTML = '<p class="no-data-message">Não há dados suficientes para mostrar o mapa de calor.</p>';
      return;
    }

    // Limpar container
    container.innerHTML = '';

    // Criar estrutura básica da tabela
    const table = document.createElement('table');
    table.className = 'heatmap-table';
    container.appendChild(table);

    // Simplificar para mostrar apenas os dados por período
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <th>Período</th>
      <th>Média de Acertos</th>
      <th>Nível</th>
    `;
    thead.appendChild(tr);
    table.appendChild(thead);

    // Adicionar corpo da tabela
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Adicionar linhas à tabela
    dados.forEach(item => {
      const tr = document.createElement('tr');
      const media = parseFloat(item.media);
      
      // Determinar nível de desempenho
      let nivel = 1;
      let classe = 'heatmap-nivel-1';
      
      if (media >= 80) {
        nivel = 5;
        classe = 'heatmap-nivel-5';
      } else if (media >= 70) {
        nivel = 4;
        classe = 'heatmap-nivel-4';
      } else if (media >= 60) {
        nivel = 3;
        classe = 'heatmap-nivel-3';
      } else if (media >= 40) {
        nivel = 2;
        classe = 'heatmap-nivel-2';
      }
      
      tr.innerHTML = `
        <td>${item.periodo}</td>
        <td>${item.media}%</td>
        <td><div class="${classe} heatmap-cell">${nivel}</div></td>
      `;
      
      tbody.appendChild(tr);
    });
  }

  // Visualizar evolução de um aluno específico
  window.visualizarEvolucaoAluno = function(alunoId) {
    if (!filteredData || !filteredData.estatisticas || !filteredData.estatisticas.avancadas) {
      alert('Dados de estatísticas não disponíveis.');
      return;
    }

    const estatisticasAvancadas = filteredData.estatisticas.avancadas;
    const alunos = estatisticasAvancadas.desempenhoIndividual || [];
    
    // Encontrar o aluno selecionado
    alunoSelecionado = alunos.find(a => a.id === alunoId);
    
    if (!alunoSelecionado) {
      alert('Dados do aluno não encontrados.');
      return;
    }

    // Atualizar mensagem informativa
    const mensagemAluno = document.getElementById('alunoSelecionado');
    if (mensagemAluno) {
      mensagemAluno.textContent = `Evolução de ${alunoSelecionado.nome} - ${alunoSelecionado.turma}`;
    }

    // Atualizar gráfico de evolução
    atualizarGraficoEvolucaoAluno();
  };

  // Atualizar gráfico de evolução do aluno
  function atualizarGraficoEvolucaoAluno() {
    const ctx = document.getElementById('evolucaoAlunoChart').getContext('2d');
    
    if (!alunoSelecionado || !alunoSelecionado.evolucao || alunoSelecionado.evolucao.length === 0) {
      ctx.canvas.parentNode.innerHTML = '<p class="no-data-message">Selecione um aluno para visualizar sua evolução ou não há dados suficientes.</p>';
      return;
    }

    // Preparar dados para o gráfico
    const dados = alunoSelecionado.evolucao;
    const labels = dados.map(item => {
      const data = new Date(item.data);
      return `${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()}`;
    });
    const valores = dados.map(item => item.percentualAcerto);
    
    const data = {
      labels: labels,
      datasets: [{
        label: 'Percentual de Acerto',
        data: valores,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    };
    
    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                const index = tooltipItems[0].dataIndex;
                return dados[index].provaTitulo;
              },
              label: function(context) {
                return `Acerto: ${context.parsed.y.toFixed(2)}%`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Percentual de Acerto (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Data da Prova'
            }
          }
        }
      }
    };

    // Criar ou atualizar gráfico
    if (evolucaoAlunoChart) {
      evolucaoAlunoChart.data = data;
      evolucaoAlunoChart.update();
    } else {
      evolucaoAlunoChart = new Chart(ctx, config);
    }
  }

  // Atualizar tabela de resultados
  function atualizarTabelaResultados() {
    // Limpar tabela
    resultsTableBody.innerHTML = '';
    
    // Filtrar resultados pelo filtro de aluno
    const filtroAluno = alunoFilter.value.toLowerCase();
    const resultadosFiltrados = filteredData.resultados.filter(resultado => {
      return filtroAluno === '' || resultado.alunoNome.toLowerCase().includes(filtroAluno);
    });
    
    // Adicionar resultados à tabela
    resultadosFiltrados.forEach(resultado => {
      // Encontrar prova correspondente
      const prova = filteredData.provas.find(p => p.id === resultado.provaId) || {};
      
      // Criar linha da tabela
      const tr = document.createElement('tr');
      
      // Adicionar células
      tr.innerHTML = `
        <td>${resultado.alunoNome}</td>
        <td>${resultado.turma}</td>
        <td>${prova.titulo || 'N/A'}</td>
        <td>${resultado.nota.toFixed(1)}</td>
        <td>${formatarData(resultado.dataRealizacao)}</td>
        <td>
          <button class="btn-action" onclick="verDetalhes('${resultado.id}')">Ver Detalhes</button>
        </td>
      `;
      
      // Adicionar linha à tabela
      resultsTableBody.appendChild(tr);
    });
    
    // Mensagem se não houver resultados
    if (resultadosFiltrados.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="6" class="no-results">Nenhum resultado encontrado</td>';
      resultsTableBody.appendChild(tr);
    }
  }

  // Atualizar questões recomendadas
  function atualizarQuestoesRecomendadas() {
    // Limpar container
    questoesRecomendadas.innerHTML = '';
    
    // Verificar se temos questões disponíveis
    if (!filteredData.questoes || filteredData.questoes.length === 0) {
      questoesRecomendadas.innerHTML = '<p class="no-results">Nenhuma questão recomendada disponível</p>';
      return;
    }
    
    // Filtrar questões por disciplina selecionada
    const disciplinaSelecionada = disciplinaFilter.value;
    let questoesFiltradas = filteredData.questoes;
    
    if (disciplinaSelecionada) {
      questoesFiltradas = questoesFiltradas.filter(q => q.disciplina === disciplinaSelecionada);
    }
    
    // Limitar a 5 questões recomendadas
    const questoesRecomendadasList = questoesFiltradas.slice(0, 5);
    
    // Adicionar questões ao container
    questoesRecomendadasList.forEach(questao => {
      const questaoElement = document.createElement('div');
      questaoElement.className = 'questao-recomendada';
      
      questaoElement.innerHTML = `
        <h3>${questao.titulo || 'Questão ' + questao.id}</h3>
        <p><strong>Disciplina:</strong> ${questao.disciplina}</p>
        <p><strong>Nível:</strong> ${questao.nivelDificuldade}</p>
        <p><strong>Conteúdo:</strong> ${questao.conteudo || 'Não especificado'}</p>
        <button class="btn-secondary btn-small" onclick="adicionarQuestao('${questao.id}')">Adicionar à Prova</button>
      `;
      
      questoesRecomendadas.appendChild(questaoElement);
    });
    
    // Mensagem se não houver questões recomendadas
    if (questoesRecomendadasList.length === 0) {
      questoesRecomendadas.innerHTML = '<p class="no-results">Nenhuma questão recomendada disponível para os filtros selecionados</p>';
    }
  }

  // Formatar data para exibição
  function formatarData(dataString) {
    if (!dataString) return 'N/A';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }

  // Função para ver detalhes de um resultado
  window.verDetalhes = function(resultadoId) {
    // Encontrar resultado pelo ID
    const resultado = filteredData.resultados.find(r => r.id === resultadoId);
    
    if (!resultado) {
      alert('Resultado não encontrado');
      return;
    }
    
    // Encontrar prova correspondente
    const prova = filteredData.provas.find(p => p.id === resultado.provaId) || {};
    
    // Preencher detalhes no modal
    const provaDetalhes = document.getElementById('provaDetalhes');
    provaDetalhes.innerHTML = `
      <div class="detalhes-prova">
        <p><strong>Aluno:</strong> ${resultado.alunoNome}</p>
        <p><strong>Turma:</strong> ${resultado.turma}</p>
        <p><strong>Prova:</strong> ${prova.titulo || 'N/A'}</p>
        <p><strong>Disciplina:</strong> ${prova.disciplina || 'N/A'}</p>
        <p><strong>Data de Realização:</strong> ${formatarData(resultado.dataRealizacao)}</p>
        <p><strong>Nota Final:</strong> ${resultado.nota.toFixed(1)}</p>
        <p><strong>Tempo de Realização:</strong> ${resultado.tempoRealizacao || 'N/A'}</p>
        
        <h3>Questões</h3>
        <div class="questoes-detalhes">
          ${gerarHTMLQuestoes(resultado.questoes || [])}
        </div>
      </div>
    `;
    
    // Exibir modal
    document.getElementById('modalDetalhes').style.display = 'flex';
  };

  // Gerar HTML para as questões do resultado
  function gerarHTMLQuestoes(questoes) {
    if (!questoes || questoes.length === 0) {
      return '<p>Nenhuma informação detalhada sobre as questões disponível</p>';
    }
    
    let html = '';
    
    questoes.forEach((questao, index) => {
      const acertou = questao.acertou ? 'acertou' : 'errou';
      
      html += `
        <div class="questao-detalhe ${acertou}">
          <p><strong>Questão ${index + 1}:</strong> ${questao.titulo || 'Sem título'}</p>
          <p><strong>Resposta do Aluno:</strong> ${questao.respostaAluno || 'Não respondida'}</p>
          <p><strong>Resposta Correta:</strong> ${questao.respostaCorreta || 'N/A'}</p>
          <p><strong>Status:</strong> <span class="status-${acertou}">${questao.acertou ? 'Acertou' : 'Errou'}</span></p>
        </div>
      `;
    });
    
    return html;
  }

  // Função para adicionar questão à prova (simulada)
  window.adicionarQuestao = function(questaoId) {
    alert(`Questão ${questaoId} adicionada à prova com sucesso!`);
  };

  // Função para fechar o modal
  window.fecharModal = function() {
    document.getElementById('modalDetalhes').style.display = 'none';
  };

  // Função para exportar relatório
  btnExportar.addEventListener('click', () => {
    if (!filteredData) {
      alert('Não há dados para exportar.');
      return;
    }
    
    // Implementação da exportação
    alert('Função de exportação será implementada em breve.');
  });

  // Função para exportar detalhes
  btnExportarDetalhes.addEventListener('click', () => {
    alert('Detalhes exportados com sucesso!');
    // Implementação real: gerar PDF ou CSV com os detalhes dos resultados
  });

  // Event listeners para filtros
  turmaFilter.addEventListener('change', aplicarFiltros);
  disciplinaFilter.addEventListener('change', aplicarFiltros);
  provaFilter.addEventListener('change', aplicarFiltros);
  periodoFilter.addEventListener('change', aplicarFiltros);
  alunoFilter.addEventListener('input', () => {
    // Apenas atualiza a tabela de resultados quando o filtro de aluno muda
    atualizarTabelaResultados();
  });

  // Aplicar filtros e atualizar dashboard
  function aplicarFiltros() {
    const turma = turmaFilter.value;
    const disciplina = disciplinaFilter.value;
    const provaId = provaFilter.value;
    const periodo = periodoFilter.value;
    
    // Filtrar provas
    let provasFiltradas = dashboardData.provas;
    
    if (turma) {
      provasFiltradas = provasFiltradas.filter(prova => prova.turma === turma);
    }
    
    if (disciplina) {
      provasFiltradas = provasFiltradas.filter(prova => prova.disciplina === disciplina);
    }
    
    if (provaId) {
      provasFiltradas = provasFiltradas.filter(prova => prova.id === provaId);
    }
    
    // Obter IDs das provas filtradas
    const provasIds = provasFiltradas.map(prova => prova.id);
    
    // Filtrar resultados com base nas provas filtradas
    const resultadosFiltrados = dashboardData.resultados.filter(resultado => {
      return provasIds.includes(resultado.provaId);
    });
    
    // Atualizar dados filtrados
    filteredData = {
      ...dashboardData,
      provas: provasFiltradas,
      resultados: resultadosFiltrados
    };
    
    // Atualizar dashboard
    atualizarDashboard();
  }

  // Inicializar dashboard
  carregarDados();
});