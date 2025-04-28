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
  const alunoFilter = document.getElementById('alunoFilter');
  const btnExportar = document.getElementById('btnExportar');
  const btnExportarDetalhes = document.getElementById('btnExportarDetalhes');
  const resultsTableBody = document.getElementById('resultsTableBody');
  const questoesRecomendadas = document.getElementById('questoesRecomendadas');

  // Estatísticas
  const totalProvasElement = document.getElementById('totalProvas');
  const mediaGeralElement = document.getElementById('mediaGeral');
  const totalAlunosElement = document.getElementById('totalAlunos');
  const taxaAprovacaoElement = document.getElementById('taxaAprovacao');

  // Gráficos
  let desempenhoChart;
  let questoesDisciplinaChart;
  let conteudoChart;
  let dificuldadeChart;

  // Dados do dashboard
  let dashboardData = null;
  let filteredData = null;

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

    // Atualizar gráficos
    atualizarGraficos();

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

  // Atualizar gráficos do dashboard
  function atualizarGraficos() {
    // Gráfico de desempenho por turma
    atualizarGraficoDesempenho();
    
    // Gráfico de questões por disciplina
    atualizarGraficoQuestoesDisciplina();
    
    // Gráfico de desempenho por conteúdo
    atualizarGraficoConteudo();
    
    // Gráfico de questões por nível de dificuldade
    atualizarGraficoDificuldade();
  }

  // Atualizar gráfico de desempenho por turma
  function atualizarGraficoDesempenho() {
    // Agrupar resultados por turma e calcular média
    const desempenhoPorTurma = {};
    const contagemPorTurma = {};
    
    filteredData.resultados.forEach(resultado => {
      if (!desempenhoPorTurma[resultado.turma]) {
        desempenhoPorTurma[resultado.turma] = 0;
        contagemPorTurma[resultado.turma] = 0;
      }
      desempenhoPorTurma[resultado.turma] += resultado.nota;
      contagemPorTurma[resultado.turma]++;
    });
    
    // Calcular médias
    const turmas = Object.keys(desempenhoPorTurma);
    const medias = turmas.map(turma => {
      return contagemPorTurma[turma] > 0 ? 
        (desempenhoPorTurma[turma] / contagemPorTurma[turma]).toFixed(1) : 0;
    });
    
    // Configurar dados do gráfico
    const data = {
      labels: turmas,
      datasets: [{
        label: 'Média de Notas',
        data: medias,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
    
    // Criar ou atualizar gráfico
    const ctx = document.getElementById('desempenhoChart').getContext('2d');
    
    if (desempenhoChart) {
      desempenhoChart.data = data;
      desempenhoChart.update();
    } else {
      desempenhoChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 10
            }
          }
        }
      });
    }
  }

  // Atualizar gráfico de questões por disciplina
  function atualizarGraficoQuestoesDisciplina() {
    // Verificar se temos estatísticas de questões
    if (!filteredData.estatisticas || !filteredData.estatisticas.questoes || !filteredData.estatisticas.questoes.porDisciplina) {
      return;
    }
    
    const estatisticas = filteredData.estatisticas.questoes.porDisciplina;
    const disciplinas = Object.keys(estatisticas);
    const quantidades = disciplinas.map(disciplina => estatisticas[disciplina]);
    
    // Configurar dados do gráfico
    const data = {
      labels: disciplinas,
      datasets: [{
        label: 'Quantidade de Questões',
        data: quantidades,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    // Criar ou atualizar gráfico
    const ctx = document.getElementById('questoesDisciplinaChart').getContext('2d');
    
    if (questoesDisciplinaChart) {
      questoesDisciplinaChart.data = data;
      questoesDisciplinaChart.update();
    } else {
      questoesDisciplinaChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    }
  }

  // Atualizar gráfico de desempenho por conteúdo
  function atualizarGraficoConteudo() {
    // Agrupar resultados por conteúdo
    const conteudos = [];
    const desempenhos = [];
    
    // Verificar se temos dados de conteúdo nas provas
    if (filteredData.provas.some(prova => prova.conteudo)) {
      const desempenhoPorConteudo = {};
      const contagemPorConteudo = {};
      
      // Mapear provas para obter conteúdos
      filteredData.provas.forEach(prova => {
        if (prova.conteudo) {
          if (!desempenhoPorConteudo[prova.conteudo]) {
            desempenhoPorConteudo[prova.conteudo] = 0;
            contagemPorConteudo[prova.conteudo] = 0;
          }
          
          // Encontrar resultados desta prova
          const resultadosProva = filteredData.resultados.filter(r => r.provaId === prova.id);
          resultadosProva.forEach(resultado => {
            desempenhoPorConteudo[prova.conteudo] += resultado.nota;
            contagemPorConteudo[prova.conteudo]++;
          });
        }
      });
      
      // Calcular médias por conteúdo
      Object.keys(desempenhoPorConteudo).forEach(conteudo => {
        conteudos.push(conteudo);
        const media = contagemPorConteudo[conteudo] > 0 ? 
          (desempenhoPorConteudo[conteudo] / contagemPorConteudo[conteudo]).toFixed(1) : 0;
        desempenhos.push(media);
      });
    }
    
    // Se não houver dados, exibir mensagem
    if (conteudos.length === 0) {
      const ctx = document.getElementById('conteudoChart').getContext('2d');
      ctx.canvas.style.display = 'none';
      const mensagem = document.createElement('p');
      mensagem.className = 'no-data-message';
      mensagem.textContent = 'Não há dados de conteúdo disponíveis';
      ctx.canvas.parentNode.appendChild(mensagem);
      return;
    } else {
      const ctx = document.getElementById('conteudoChart');
      ctx.style.display = 'block';
      const mensagem = ctx.parentNode.querySelector('.no-data-message');
      if (mensagem) mensagem.remove();
    }
    
    // Configurar dados do gráfico
    const data = {
      labels: conteudos,
      datasets: [{
        label: 'Média de Desempenho',
        data: desempenhos,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false
      }]
    };
    
    // Criar ou atualizar gráfico
    const ctx = document.getElementById('conteudoChart').getContext('2d');
    
    if (conteudoChart) {
      conteudoChart.data = data;
      conteudoChart.update();
    } else {
      conteudoChart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
          responsive: true,
          scales: {
            r: {
              beginAtZero: true,
              max: 10
            }
          }
        }
      });
    }
  }

  // Atualizar gráfico de questões por nível de dificuldade
  function atualizarGraficoDificuldade() {
    // Verificar se temos estatísticas de questões
    if (!filteredData.estatisticas || !filteredData.estatisticas.questoes || !filteredData.estatisticas.questoes.porNivelDificuldade) {
      return;
    }
    
    const estatisticas = filteredData.estatisticas.questoes.porNivelDificuldade;
    const niveis = Object.keys(estatisticas);
    const quantidades = niveis.map(nivel => estatisticas[nivel]);
    
    // Configurar dados do gráfico
    const data = {
      labels: niveis,
      datasets: [{
        label: 'Quantidade de Questões',
        data: quantidades,
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',  // Fácil
          'rgba(255, 206, 86, 0.5)',  // Médio
          'rgba(255, 99, 132, 0.5)'   // Difícil
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    // Criar ou atualizar gráfico
    const ctx = document.getElementById('dificuldadeChart').getContext('2d');
    
    if (dificuldadeChart) {
      dificuldadeChart.data = data;
      dificuldadeChart.update();
    } else {
      dificuldadeChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
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
    alert('Relatório exportado com sucesso!');
    // Implementação real: gerar PDF ou CSV com os dados filtrados
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
  alunoFilter.addEventListener('input', () => {
    // Apenas atualiza a tabela de resultados quando o filtro de aluno muda
    atualizarTabelaResultados();
  });

  // Aplicar filtros e atualizar dashboard
  function aplicarFiltros() {
    const turma = turmaFilter.value;
    const disciplina = disciplinaFilter.value;
    const provaId = provaFilter.value;
    
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