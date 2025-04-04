// ===========================
// REALIZAR-PROVA.JS
// ===========================

document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const provaTitle = document.getElementById('provaTitle');
  const alunoInfo = document.getElementById('alunoInfo');
  const questoesContainer = document.getElementById('questoesContainer');
  const timer = document.getElementById('timer');
  const btnFinalizarProva = document.getElementById('btnFinalizarProva');
  const modalConfirmacao = document.getElementById('modalConfirmacao');
  const btnCancelarFinalizacao = document.getElementById('btnCancelarFinalizacao');
  const btnConfirmarFinalizacao = document.getElementById('btnConfirmarFinalizacao');
  const modalResultado = document.getElementById('modalResultado');
  const resultadoConteudo = document.getElementById('resultadoConteudo');
  const btnFecharResultado = document.getElementById('btnFecharResultado');
  
  // Variáveis globais
  let prova = null;
  let aluno = null;
  let respostasAluno = [];
  let tempoInicial = null;
  let tempoLimite = 60 * 60 * 1000; // 1 hora em milissegundos
  let timerInterval = null;
  
  // Inicialização
  init();
  
  async function init() {
    // Verificar se o aluno está logado
    aluno = JSON.parse(localStorage.getItem('currentStudent'));
    if (!aluno || !aluno.isActive) {
      alert('Você precisa fazer login para acessar a prova.');
      window.location.href = '/pages/login-aluno.html';
      return;
    }
    
    try {
      // Mostrar mensagem de carregamento
      provaTitle.textContent = 'Carregando prova...';
      alunoInfo.textContent = `Aluno: ${aluno.name} | Turma: ${aluno.class}`;
      
      // Carregar a prova diretamente do banco de dados usando o código da prova
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/provas/codigo/${aluno.examCode}`, {
        method: 'GET',
        headers: API_CONFIG.getHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Erro ao carregar a prova');
      }
      
      const data = await response.json();
      prova = data.prova;
      
      if (!prova) {
        throw new Error('Não foi possível carregar a prova');
      }
      
      // Salvar a prova no localStorage como backup
      localStorage.setItem('currentProva', JSON.stringify(prova));
      
      // Exibir informações da prova e do aluno
      provaTitle.textContent = prova.titulo || prova.nomeProva;
      alunoInfo.textContent = `Aluno: ${aluno.name} | Turma: ${aluno.class}`;
      
      // Definir o tempo limite com base na duração da prova (se disponível)
      if (prova.duracao) {
        tempoLimite = prova.duracao * 60 * 1000; // Converter minutos para milissegundos
      }
      
      // Inicializar o timer
      iniciarTimer();
      
      // Carregar as questões
      carregarQuestoes();
      
      // Adicionar event listeners
      btnFinalizarProva.addEventListener('click', abrirModalConfirmacao);
      btnCancelarFinalizacao.addEventListener('click', fecharModalConfirmacao);
      btnConfirmarFinalizacao.addEventListener('click', finalizarProva);
      btnFecharResultado.addEventListener('click', fecharModalResultado);
    } catch (error) {
      console.error('Erro ao inicializar a prova:', error);
      alert(`Erro ao carregar a prova: ${error.message}. Por favor, faça login novamente.`);
      window.location.href = '/pages/login-aluno.html';
    }
  }
  
  function iniciarTimer() {
    tempoInicial = new Date().getTime();
    
    timerInterval = setInterval(function() {
      const agora = new Date().getTime();
      const tempoDecorrido = agora - tempoInicial;
      const tempoRestante = tempoLimite - tempoDecorrido;
      
      if (tempoRestante <= 0) {
        clearInterval(timerInterval);
        finalizarProva();
      } else {
        const horas = Math.floor((tempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tempoRestante % (1000 * 60)) / 1000);
        
        timer.textContent = `Tempo restante: ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
      }
    }, 1000);
  }
  
  function carregarQuestoes() {
    questoesContainer.innerHTML = '';
    
    if (!prova.questoes || prova.questoes.length === 0) {
      questoesContainer.innerHTML = '<p>Nenhuma questão disponível para esta prova.</p>';
      return;
    }
    
    // Inicializar array de respostas do aluno
    respostasAluno = new Array(prova.questoes.length).fill(null);
    
    // Criar elementos para cada questão
    prova.questoes.forEach((questao, index) => {
      const questaoElement = document.createElement('div');
      questaoElement.classList.add('questao');
      
      // Preparar HTML da imagem se existir
      const imagemHTML = questao.imagem ? `<div class="question-image"><img src="${questao.imagem}" alt="Imagem da questão" /></div>` : '';
      
      // Criar HTML da questão
      questaoElement.innerHTML = `
        <div class="questao-header">
          <h3>Questão ${index + 1}</h3>
          <span class="questao-dificuldade">${questao.difficulty || 'PADRÃO'}</span>
        </div>
        <p class="questao-enunciado">${questao.enunciado}</p>
        ${imagemHTML}
        <div class="alternativas">
          ${questao.alternativas.map((alt, i) => `
            <div class="alternativa">
              <input type="radio" name="questao-${index}" id="questao-${index}-alt-${i}" value="${i}">
              <label for="questao-${index}-alt-${i}">${alt.texto}</label>
            </div>
          `).join('')}
        </div>
      `;
      
      // Adicionar event listeners para as alternativas
      const alternativasInputs = questaoElement.querySelectorAll(`input[name="questao-${index}"]`);
      alternativasInputs.forEach(input => {
        input.addEventListener('change', function() {
          respostasAluno[index] = parseInt(this.value);
        });
      });
      
      questoesContainer.appendChild(questaoElement);
    });
  }
  
  function abrirModalConfirmacao() {
    modalConfirmacao.style.display = 'flex';
  }
  
  function fecharModalConfirmacao() {
    modalConfirmacao.style.display = 'none';
  }
  
  async function finalizarProva() {
    // Parar o timer
    clearInterval(timerInterval);
    
    // Fechar modal de confirmação
    fecharModalConfirmacao();
    
    try {
      // Verificar se temos a versão mais recente da prova
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/provas/codigo/${aluno.examCode}`, {
        method: 'GET',
        headers: API_CONFIG.getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.prova) {
          // Atualizar a prova com os dados mais recentes do banco
          prova = data.prova;
          // Atualizar o localStorage com a versão mais recente
          localStorage.setItem('currentProva', JSON.stringify(prova));
        }
      }
    } catch (error) {
      console.warn('Não foi possível atualizar os dados da prova antes de finalizar:', error);
      // Continuar com os dados que já temos
    }
    
    // Calcular resultado
    let acertos = 0;
    const resultados = prova.questoes.map((questao, index) => {
      const respostaAluno = respostasAluno[index];
      
      // Encontrar o índice da alternativa correta (que tem correta = true)
      const respostaCorretaIndex = questao.alternativas.findIndex(alt => alt.correta === true);
      
      // Verificar se o aluno acertou
      const acertou = respostaAluno === respostaCorretaIndex;
      
      if (acertou) acertos++;
      
      return {
        questao: index + 1,
        respostaAluno: respostaAluno !== null ? 
          (questao.alternativas[respostaAluno] ? questao.alternativas[respostaAluno].texto : 'Não respondida') : 
          'Não respondida',
        respostaCorreta: respostaCorretaIndex !== -1 ? 
          questao.alternativas[respostaCorretaIndex].texto : 
          'Não definida',
        acertou
      };
    });
    
    // Calcular nota (0 a 10)
    const nota = (acertos / prova.questoes.length) * 10;
    
    // Criar objeto de resultado
    const resultado = {
      aluno: aluno,
      prova: {
        codigo: prova.codigoProva,
        nome: prova.titulo || prova.nomeProva,
        id: prova._id // Incluir o ID da prova para referência no banco de dados
      },
      respostas: resultados,
      acertos,
      total: prova.questoes.length,
      nota: nota.toFixed(1),
      dataFinalizacao: new Date().toISOString(),
      questoesSelecionadas: prova.questoes,
      resultadoId: localStorage.getItem('resultadoId') // Incluir o ID do resultado se disponível
    };
    
    try {
      // Obter o ID do resultado que foi criado quando o aluno iniciou a prova
      const resultadoId = localStorage.getItem('resultadoId');
      
      if (!resultadoId) {
        console.error('ID do resultado não encontrado');
        throw new Error('ID do resultado não encontrado');
      }
      
      // Preparar os dados para atualizar o resultado existente
      const dadosAtualizacao = {
        resultadoId: resultadoId,
        respostas: resultado.respostas.map(r => ({
          questao: r.questao - 1, // Ajustar para o índice da questão (0-based)
          alternativaSelecionada: r.respostaAluno !== 'Não respondida' ? 
            resultado.questoesSelecionadas[r.questao - 1].alternativas.findIndex(alt => alt.texto === r.respostaAluno) : -1,
          correta: r.acertou,
          pontuacao: r.acertou ? 1 : 0 // Ajustar conforme a pontuação da questão
        })).filter(r => r.alternativaSelecionada !== -1) // Remover questões não respondidas
      };
      
      // Enviar resultado para o backend usando a rota correta
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/resultados/finalizar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...API_CONFIG.getHeaders()
          },
          body: JSON.stringify(dadosAtualizacao)
        });
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error('Erro ao salvar resultado no servidor:', errorData.msg || 'Erro desconhecido');
          } catch (parseError) {
            const textError = await response.text();
            console.error('Erro ao salvar resultado no servidor:', textError || 'Erro desconhecido');
          }
          throw new Error('Falha ao salvar resultado');
        }
        
        console.log('Resultado salvo com sucesso!');
        // Limpar dados temporários do localStorage após salvar no banco
        localStorage.removeItem('selectedQuestions');
        localStorage.removeItem('currentProva');
        
        return response;
      } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao enviar resultado para o servidor:', error);
    }
    
    // Exibir resultado
    exibirResultado(resultado);
    
    // Marcar aluno como inativo (prova finalizada)
    aluno.isActive = false;
    localStorage.setItem('currentStudent', JSON.stringify(aluno));
  }
  
  function exibirResultado(resultado) {
    resultadoConteudo.innerHTML = `
      <div class="resultado-header">
        <h4>${resultado.prova.nome}</h4>
        <p>Aluno: ${resultado.aluno.name}</p>
        <p>Turma: ${resultado.aluno.class}</p>
      </div>
      <div class="resultado-resumo">
        <p class="nota">Nota: <strong>${resultado.nota}</strong></p>
        <p>Acertos: ${resultado.acertos} de ${resultado.total}</p>
      </div>
      <div class="resultado-detalhes">
        <h4>Detalhes por questão:</h4>
        <ul>
          ${resultado.respostas.map(r => `
            <li>
              <strong>Questão ${r.questao}:</strong> 
              ${r.acertou ? '<span class="acerto">Correta</span>' : '<span class="erro">Incorreta</span>'}<br>
              Sua resposta: ${r.respostaAluno}<br>
              ${!r.acertou ? `Resposta correta: ${r.respostaCorreta}` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    
    modalResultado.style.display = 'flex';
  }
  
  function fecharModalResultado() {
    modalResultado.style.display = 'none';
    window.location.href = '/index.html';
  }
  
  // Adicionar evento para limpar selectedQuestions ao carregar a página
  window.addEventListener('load', () => {
    localStorage.removeItem('selectedQuestions');
  });
});