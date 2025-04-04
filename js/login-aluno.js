// ===========================
// LOGIN-ALUNO.JS
// ===========================

// Função para registrar o acesso do aluno no banco de dados
async function registrarAcessoAluno(studentInfo, prova) {
  try {
    console.log('Iniciando registro de acesso para:', studentInfo.name);
    
    // Preparar dados para enviar ao backend
    const acessoData = {
      nomeAluno: studentInfo.name,
      turma: studentInfo.class,
      codigoProva: studentInfo.examCode,
      idProva: prova._id,
      dataAcesso: new Date().toISOString(),
      status: 'iniciado'
    };
    
    console.log('Dados de acesso preparados:', acessoData);
    
    // Enviar dados para o backend
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/resultados/registrar-acesso`, {
      method: 'POST',
      headers: API_CONFIG.getHeaders(),
      body: JSON.stringify(acessoData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Acesso registrado com sucesso:', data);
      // Armazenar o ID do resultado para atualização posterior
      localStorage.setItem('resultadoId', data.resultado._id);
      return true;
    } else {
      console.error('Erro ao registrar acesso:', data.msg);
      alert(`Erro ao registrar acesso: ${data.msg || 'Erro desconhecido'}`);
      return false;
    }
  } catch (error) {
    console.error('Erro ao registrar acesso do aluno:', error);
    alert(`Erro ao registrar acesso: ${error.message || 'Erro desconhecido'}`);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  // Usar a configuração centralizada da API
  // A URL já está sendo usada nas chamadas fetch abaixo
  
  // Handle form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const studentName = document.getElementById('studentName').value.trim();
      const examCode = document.getElementById('examCode').value.trim();
      const studentClass = document.getElementById('studentClass').value;
      
      // Validação básica do formulário
      if (!studentName || !examCode || !studentClass) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      try {
        // Busca a prova pelo código informado no backend
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/provas/codigo/${examCode}`, {
          method: 'GET',
          headers: API_CONFIG.getHeaders()
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          alert(data.msg || 'Código de prova inválido. Verifique o código e tente novamente.');
          return;
        }
        
        const prova = data.prova;
        
        // Verifica se a prova existe
        if (!prova) {
          alert('Código de prova inválido. Verifique o código e tente novamente.');
          return;
        }
        
        // Verifica se o aluno tem permissão para acessar esta prova (baseado na turma)
        if (!prova.turmas.includes(studentClass)) {
          alert('Você não tem permissão para acessar esta prova. Verifique se selecionou a turma correta.');
          return;
        }
        
        // Armazena informações do aluno no localStorage
        const studentInfo = {
          name: studentName,
          examCode: examCode,
          class: studentClass,
          loginTime: new Date().toISOString(),
          isActive: true
        };
        
        localStorage.setItem('currentStudent', JSON.stringify(studentInfo));
        localStorage.setItem('currentProva', JSON.stringify(prova));
      
        // Registra o acesso do aluno
        const registroSucesso = await registrarAcessoAluno(studentInfo, prova);
        
        if (registroSucesso) {
          // Redireciona para a página de realização da prova
          alert(`Bem-vindo(a), ${studentName}! Você está acessando a prova: ${prova.titulo || prova.nomeProva}`);
          window.location.href = '/pages/realizar-prova.html';
        }
        // Se o registro falhar, a função registrarAcessoAluno já mostrará um alerta de erro
      } catch (error) {
        console.error('Erro ao processar login:', error);
        alert(`Erro ao processar login: ${error.message || 'Erro desconhecido'}`);
      }
    });
  }
  
  // Verifica se o aluno já está logado
  const currentStudent = JSON.parse(localStorage.getItem('currentStudent'));
  if (currentStudent && currentStudent.isActive) {
    // Opção: redirecionar automaticamente para a página da prova
    // Descomente a linha abaixo para ativar este recurso
    // window.location.href = '/pages/realizar-prova.html';
  }
});