// ===========================
// MODALQUEST.JS
// ===========================

// Verificar se API_CONFIG está definido, caso contrário, definir com valores padrão
if (typeof API_CONFIG === 'undefined') {
  console.warn('API_CONFIG não encontrado, usando configuração padrão');
  window.API_CONFIG = {
    QUESTOES_API_URL: 'https://api-quest-xf6a.onrender.com',
    getToken: function() {
      return localStorage.getItem('token');
    },
    getHeaders: function() {
      return {
        'Content-Type': 'application/json'
      };
    },
    getAuthHeaders: function() {
      return {
        'Content-Type': 'application/json',
        'x-auth-token': this.getToken()
      };
    }
  };
}

// Variável para armazenar a última questão criada
let ultimaQuestaoCriada = null;

// Elementos do DOM
document.addEventListener('DOMContentLoaded', function() {
  const btnAddQuestaoPessoal = document.getElementById('btnAddQuestaoPessoal');
  const modalAddQuestao = document.getElementById('modalAddQuestao');
  const closeModalAddQuestao = document.getElementById('closeModalAddQuestao');
  const formAddQuestao = document.getElementById('formAddQuestao');
  const questionText = document.getElementById('questionText');
  const seriesIndicada = document.getElementById('seriesIndicada');
  const difficulty = document.getElementById('difficulty');
  const questionsSection = document.querySelector('.questions-section');
  
  // Elementos do modal de confirmação
  const modalConfirmacaoAdicao = document.getElementById('modalConfirmacaoAdicao');
  const closeModalConfirmacao = document.getElementById('closeModalConfirmacao');
  const btnAdicionarProva = document.getElementById('btnAdicionarProva');
  const btnNaoAdicionarProva = document.getElementById('btnNaoAdicionarProva');

  // Abrir modal de adicionar questão
  if (btnAddQuestaoPessoal) {
    btnAddQuestaoPessoal.addEventListener('click', () => {
      modalAddQuestao.style.display = 'flex';
      // Reset form
      if (formAddQuestao) formAddQuestao.reset();
      if (questionText) questionText.innerHTML = '';
    });
  }

  // Fechar modal
  if (closeModalAddQuestao) {
    closeModalAddQuestao.addEventListener('click', () => {
      modalAddQuestao.style.display = 'none';
    });
  }

  // Fechar modal clicando fora
  if (modalAddQuestao) {
    modalAddQuestao.addEventListener('click', (e) => {
      if (e.target === modalAddQuestao) {
        modalAddQuestao.style.display = 'none';
      }
    });
  }
  
  // Fechar modal de confirmação
  if (closeModalConfirmacao) {
    closeModalConfirmacao.addEventListener('click', () => {
      modalConfirmacaoAdicao.style.display = 'none';
    });
  }
  
  // Fechar modal de confirmação clicando fora
  if (modalConfirmacaoAdicao) {
    modalConfirmacaoAdicao.addEventListener('click', (e) => {
      if (e.target === modalConfirmacaoAdicao) {
        modalConfirmacaoAdicao.style.display = 'none';
      }
    });
  }
  
  // Botão "Não, apenas salvar"
  if (btnNaoAdicionarProva) {
    btnNaoAdicionarProva.addEventListener('click', () => {
      modalConfirmacaoAdicao.style.display = 'none';
      // Não faz nada além de fechar o modal
    });
  }
  
  // Botão "Sim, adicionar à prova"
  if (btnAdicionarProva) {
    btnAdicionarProva.addEventListener('click', () => {
      if (ultimaQuestaoCriada) {
        // Adicionar à prova atual (utilizando a lógica existente para adicionar questões à prova)
        addQuestionToCurrentTest(ultimaQuestaoCriada);
        modalConfirmacaoAdicao.style.display = 'none';
      } else {
        alert('Erro: Não foi possível encontrar a questão criada');
        modalConfirmacaoAdicao.style.display = 'none';
      }
    });
  }

  // Salvar questão pessoal
  if (formAddQuestao) {
    formAddQuestao.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Obter valores dos campos essenciais
      const questionExplanationEditor = document.getElementById('questionExplanation');
      const explanation = questionExplanationEditor ? questionExplanationEditor.innerHTML.trim() : '';

      // Validar campos essenciais
      if (!questionText.textContent.trim()) {
        alert('Por favor, preencha o enunciado da questão.');
        return;
      }
      
      // Validar disciplina
      const disciplinaQuestao = document.getElementById('disciplinaQuestao');
      if (!disciplinaQuestao.value) {
        alert('Por favor, selecione a disciplina.');
        return;
      }
      
      if (!seriesIndicada.value) {
        alert('Por favor, selecione a série indicada.');
        return;
      }

      if (!explanation) {
        alert('Por favor, preencha a explicação da resposta correta.');
        return;
      }
      
      // Obter alternativas
      const alternativeInputs = document.querySelectorAll('input[name="alternativeText[]"]');
      const alternatives = Array.from(alternativeInputs).map(input => input.value);
      
      // Verificar se todas as alternativas foram preenchidas
      if (alternatives.some(alt => !alt.trim())) {
        alert('Por favor, preencha todas as alternativas.');
        return;
      }
      
      // Obter alternativa correta
      const correctAlternative = document.querySelector('input[name="correctAlternative"]:checked');
      if (!correctAlternative) {
        alert('Por favor, selecione a alternativa correta.');
        return;
      }
      
      // Obter tags
      const tagsQuestao = document.getElementById('tagsQuestao');
      const tags = tagsQuestao.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      
      // Criar nova questão
      const newQuestion = {
        enunciado: questionText.innerHTML,
        alternativas: alternatives,
        correctAlternative: parseInt(correctAlternative.value),
        series: seriesIndicada.value,
        disciplina: disciplinaQuestao.value,
        difficulty: difficulty.value,
        tags: tags
      };
      
      // Salvar no banco de dados
      try {
        // Usar a configuração centralizada da API
        const API_URL = API_CONFIG.QUESTOES_API_URL;
        
        // Formatar dados para o backend conforme a estrutura da API
        const tituloQuestao = document.getElementById('tituloQuestao').value.trim();
        if (!tituloQuestao) {
          alert('Por favor, preencha o título da questão.');
          return;
        }

        // Formatar alternativas no formato correto para a API
        const alternativasFormatadas = alternatives.map((texto, index) => ({
          texto: texto,
          correta: parseInt(correctAlternative.value, 10) === index
        }));

        // Processar imagens se existirem
        const imagensInput = document.getElementById('imagensQuestao');
        let imagens = [];
        
        // Verificar se há imagens selecionadas
        if (imagensInput.files.length > 0) {
          // Converter imagens para base64 (será feito de forma assíncrona abaixo)
          for (let i = 0; i < imagensInput.files.length; i++) {
            const file = imagensInput.files[i];
            try {
              const base64 = await convertFileToBase64(file);
              imagens.push(base64);
            } catch (error) {
              console.error('Erro ao converter imagem para base64:', error);
              alert('Erro ao processar imagem: ' + error.message);
              return;
            }
          }
        }

        const questaoPessoalData = {
          titulo: tituloQuestao,
          enunciado: questionText.innerHTML,
          alternativas: alternativasFormatadas,
          explicacao: explanation,
          disciplina: disciplinaQuestao.value,
          anoEscolar: parseInt(seriesIndicada.value, 10),
          nivelDificuldade: difficulty.value,
          tags: tags,
          imagens: imagens.length > 0 ? imagens : undefined
        };
        
        // Remover campos vazios
        Object.keys(questaoPessoalData).forEach(key => {
          if (questaoPessoalData[key] === '' || questaoPessoalData[key] === null) {
            delete questaoPessoalData[key];
          }
        });
        
        console.log('Enviando questão:', questaoPessoalData);
        
        // Enviar para o backend
        const response = await fetch(`${API_URL}/api/v1/questoes`, {
          method: 'POST',
          headers: API_CONFIG.getAuthHeaders(),
          body: JSON.stringify(questaoPessoalData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Erro ao salvar questão no servidor:', data);
          const errorMessage = data.msg || data.error || 'Erro desconhecido';
          alert('Erro ao salvar questão no servidor: ' + errorMessage);
          return; // Não continuar se houver erro no servidor
        }
        
        console.log('Questão salva com sucesso no servidor:', data);
        
        // Armazenar a questão recém-criada na variável global
        ultimaQuestaoCriada = {
          ...newQuestion,
          id: data._id || data.id || 'temp_' + Date.now(),
          imagem: imagens.length > 0 ? imagens[0] : null
        };
        
        // Adicionar à interface do repositório de questões
        addPersonalQuestionToUI(newQuestion);
        
        // Fechar modal de criação
        modalAddQuestao.style.display = 'none';
        
        // Exibir modal de confirmação
        modalConfirmacaoAdicao.style.display = 'flex';
        
      } catch (error) {
        console.error('Erro ao salvar questão no servidor:', error);
        alert('Erro ao salvar questão no servidor: ' + error.message);
        return; // Não continuar se houver erro
      }
    });
  }
  
  // Função para converter arquivo para base64
  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Função para adicionar questão pessoal à interface
  function addPersonalQuestionToUI(question) {
    const questionCard = document.createElement('div');
    questionCard.classList.add('question-card');
    
    // Criar letras para alternativas
    const letters = ['a)', 'b)', 'c)', 'd)'];
    
    // Preparar HTML da imagem se existir
    const imagemHTML = question.imagem ? `<div class="question-image"><img src="${question.imagem}" alt="Imagem da questão" /></div>` : '';
    
    // Criar HTML da questão
    questionCard.innerHTML = `
      <div class="question-header">
        <span class="question-info">Questão Pessoal | (${question.series})</span>
        <span class="question-difficulty">${question.difficulty}</span>
      </div>
      <p class="question-enunciado">${question.enunciado}</p>
      ${imagemHTML}
      <ul class="question-alternativas">
        ${question.alternativas.map((alt, index) => 
          `<li ${index === question.correctAlternative ? 'class="correct-alternative"' : ''}>${letters[index]} ${alt}</li>`
        ).join('')}
      </ul>
      <button class="btn-add-questao">ADICIONAR</button>
    `;
    
    // Adicionar à seção de questões
    const questionsSection = document.querySelector('.questions-section');
    if (questionsSection) {
      questionsSection.appendChild(questionCard);
      
      // Adicionar event listener para o botão de adicionar
      const btnAdd = questionCard.querySelector('.btn-add-questao');
      if (btnAdd) {
        btnAdd.addEventListener('click', function() {
          const card = this.closest('.question-card');
          if (card) {
            const questionData = getQuestionData(card);
            addQuestionToCurrentTest(questionData);
            
            // Atualizar botão após adicionar
            this.textContent = 'ADICIONADA';
            this.disabled = true;
            this.style.backgroundColor = '#4CAF50';
          }
        });
      }
    }
  }
  
  // Função para adicionar questão à prova atual
  function addQuestionToCurrentTest(question) {
    try {
      // Obter questões já selecionadas
      const storedQuestions = JSON.parse(localStorage.getItem('selectedQuestions')) || [];
      
      // Verificar se a questão já foi adicionada
      if (!storedQuestions.some(q => q.enunciado === question.enunciado)) {
        // Adicionar a nova questão
        storedQuestions.push(question);
        
        // Salvar de volta no localStorage
        localStorage.setItem('selectedQuestions', JSON.stringify(storedQuestions));
        
        // Atualizar o contador de questões
        const numeroQuestoes = document.getElementById('numeroQuestoes');
        if (numeroQuestoes) {
          numeroQuestoes.value = storedQuestions.length;
          localStorage.setItem('numeroQuestoes', numeroQuestoes.value);
        }
        
        console.log('Questão adicionada à prova com sucesso!', question);
        
        // Feedback para o usuário
        alert('Questão adicionada à prova com sucesso!');
      } else {
        alert("Essa questão já foi adicionada à prova.");
      }
    } catch (error) {
      console.error('Erro ao adicionar questão à prova:', error);
      alert('Erro ao adicionar questão à prova: ' + error.message);
    }
  }
});

// Função para extrair dados da questão de um card (precisa estar no escopo global)
function getQuestionData(card) {
  const correctAlternativeIndex = Array.from(card.querySelectorAll('.question-alternativas li'))
    .findIndex(li => li.classList.contains('correct-alternative'));
  
  let seriesInfo = '';
  const questionInfo = card.querySelector('.question-info');
  if (questionInfo) {
    const infoText = questionInfo.innerText;
    if (infoText.includes('|')) {
      seriesInfo = infoText.split('|')[1]?.trim() || '';
    }
  }
  
  // Verificar se há imagem
  let imagem = null;
  const imagemElement = card.querySelector('.question-image img');
  if (imagemElement && imagemElement.src) {
    imagem = imagemElement.src;
  }
  
  return {
    enunciado: card.querySelector('.question-enunciado').innerHTML,
    alternativas: Array.from(card.querySelectorAll('.question-alternativas li'))
      .map(li => {
        // Remover a letra (a), b), etc) do início do texto da alternativa
        const text = li.innerText;
        return text.replace(/^[a-d]\)\s+/i, '');
      }),
    difficulty: card.querySelector('.question-difficulty').innerText.trim(),
    correctAlternative: correctAlternativeIndex >= 0 ? correctAlternativeIndex : 0,
    series: seriesInfo,
    imagem: imagem
  };
}
