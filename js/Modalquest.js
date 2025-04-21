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
        imagem: imagemBase64, // Adicionar imagem se existir
        tags: tags
      };
      
      // Salvar no banco de dados
      try {
        // Usar a configuração centralizada da API
        const API_URL = API_CONFIG.QUESTOES_API_URL;
        
        // Formatar dados para o backend conforme a estrutura da API
        const questaoPessoalData = {
          enunciado: questionText.innerHTML,
          alternativas: alternatives,
          alternativaCorreta: alternatives[parseInt(correctAlternative.value, 10)],
          explicacao: explanation,
          disciplina: disciplinaQuestao.value,
          anoEscolar: parseInt(seriesIndicada.value, 10),
          nivelDificuldade: difficulty.value,
          tags: tags
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
        
        // Adicionar à interface apenas após salvar com sucesso no banco de dados
        addPersonalQuestionToUI(newQuestion);
      } catch (error) {
        console.error('Erro ao salvar questão no servidor:', error);
        alert('Erro ao salvar questão no servidor: ' + error.message);
        return; // Não continuar se houver erro
      }
      
      // Fechar modal
      modalAddQuestao.style.display = 'none';
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
    
    // Adicionar evento ao botão
    // Inside the addPersonalQuestionToUI function, update the button click handler:
    const addButton = questionCard.querySelector('.btn-add-questao');
    if (addButton) {
      addButton.addEventListener('click', async function() {
        try {
          // Obter token e ID do professor
          const token = localStorage.getItem('token');
          const professorId = localStorage.getItem('professorId');
          
          if (!token || !professorId) {
            alert('Token ou ID do professor não encontrado. Faça login novamente para adicionar questões.');
            return;
          }
          
          // Adicionar à lista de questões selecionadas no servidor
          const API_URL = API_CONFIG.QUESTOES_API_URL;
          
          // Obter o ID da questão do atributo data-id (precisa ser adicionado ao elemento)
          const questionId = questionCard.getAttribute('data-id');
          
          if (!questionId) {
            // Se não tiver ID, adicionar diretamente à lista de questões selecionadas
            const selectedQuestions = JSON.parse(sessionStorage.getItem('selectedQuestions') || localStorage.getItem('selectedQuestions')) || [];
            selectedQuestions.push({
              enunciado: question.enunciado,
              alternativas: question.alternativas.map((alt, index) => `${letters[index]} ${alt}`),
              correctAlternative: question.correctAlternative,
              difficulty: question.difficulty,
              series: question.series,
              imagem: question.imagem // Incluir a imagem se existir
            });
            sessionStorage.setItem('selectedQuestions', JSON.stringify(selectedQuestions));
          }
          
          // Update button state
          this.textContent = 'ADICIONADA';
          this.disabled = true;
          this.style.backgroundColor = '#4CAF50';
        } catch (error) {
          console.error('Erro ao adicionar questão:', error);
          alert('Erro ao adicionar questão: ' + error.message);
        }
      });
    }
    
    // Adicionar à seção de questões
    questionsSection.appendChild(questionCard);
  }

  // Adicionar event listeners aos botões de adicionar questão existentes
  const addButtons = document.querySelectorAll('.btn-add-questao');
  addButtons.forEach(button => {
    button.addEventListener('click', async function() {
      try {
        const questionCard = this.closest('.question-card');
        const enunciado = questionCard.querySelector('.question-enunciado').textContent;
        const alternativasElements = questionCard.querySelectorAll('.question-alternativas li');
        const alternativas = Array.from(alternativasElements).map(li => li.textContent);
        const correctIndex = Array.from(alternativasElements).findIndex(li => li.classList.contains('correct-alternative'));
        const difficultyElement = questionCard.querySelector('.question-difficulty');
        const difficulty = difficultyElement ? difficultyElement.textContent : 'PADRÃO';
        
        // Obter a imagem se existir
        const imagemElement = questionCard.querySelector('.question-image img');
        const imagem = imagemElement ? imagemElement.src : null;
        
        // Obter token e ID do professor
        const token = localStorage.getItem('token');
        const professorId = localStorage.getItem('professorId');
        
        if (!token || !professorId) {
          alert('Token ou ID do professor não encontrado. Faça login novamente para adicionar questões.');
          return;
        }
        
        // Adicionar à lista de questões selecionadas no servidor
        const API_URL = API_CONFIG.QUESTOES_API_URL;
        
        // Adicionar à lista de questões selecionadas temporariamente
        const selectedQuestions = JSON.parse(sessionStorage.getItem('selectedQuestions') || localStorage.getItem('selectedQuestions')) || [];
        selectedQuestions.push({
          enunciado: enunciado,
          alternativas: alternativas,
          correctAlternative: correctIndex,
          difficulty: difficulty,
          imagem: imagem // Incluir a imagem se existir
        });
        sessionStorage.setItem('selectedQuestions', JSON.stringify(selectedQuestions));
        
        // Feedback visual
        this.textContent = 'ADICIONADA';
        this.disabled = true;
        this.style.backgroundColor = '#4CAF50';
      } catch (error) {
        console.error('Erro ao adicionar questão:', error);
        alert('Erro ao adicionar questão: ' + error.message);
      }
    });
  });
});