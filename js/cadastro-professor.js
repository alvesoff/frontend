// ===========================
// CADASTRO-PROFESSOR.JS
// ===========================

document.addEventListener('DOMContentLoaded', function() {
  const cadastroForm = document.getElementById('cadastroForm');
  
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Obter valores do formulário
      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const senha = document.getElementById('senha').value.trim();
      const confirmarSenha = document.getElementById('confirmarSenha').value.trim();
      
      // Disciplinas removidas conforme solicitação
      
      // Validar campos
      if (!nome || !email || !senha || !confirmarSenha) {
        showError('Por favor, preencha todos os campos.');
        return;
      }
      
      if (senha !== confirmarSenha) {
        showError('As senhas não coincidem.');
        return;
      }
      
      if (senha.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      
      // Validação de disciplinas removida
      
      try {
        // Preparar dados para envio
        const professorData = {
          nome,
          email,
          senha,
          tipo: 'professor'
          // disciplinas removidas conforme solicitação
        };
        
        // Enviar requisição para o backend usando API_CONFIG
        const data = await API_CONFIG.api.usuarios.registro(professorData);
        
        if (data.token) {
          // Cadastro bem-sucedido
          alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
          window.location.href = '/pages/login-professor.html';
        } else {
          // Cadastro falhou
          showError(data.msg || 'Erro ao realizar cadastro. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao cadastrar professor:', error);
        showError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      }
    });
  }
  
  // Função para mostrar mensagem de erro
  function showError(message) {
    // Verificar se já existe uma mensagem de erro
    let errorElement = document.querySelector('.login-error');
    
    if (!errorElement) {
      // Criar elemento de erro se não existir
      errorElement = document.createElement('div');
      errorElement.className = 'login-error';
      const form = document.querySelector('.login-form');
      form.insertBefore(errorElement, form.querySelector('button'));
    }
    
    // Definir mensagem e mostrar
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
});