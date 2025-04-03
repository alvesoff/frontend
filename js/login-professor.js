// login-professor.js
// Script para gerenciar o login do professor

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Obter valores do formulário
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const rememberMe = document.querySelector('input[name="remember"]').checked;
      
      // Validar campos
      if (!email || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
      }
      
      try {
        // Enviar requisição para o backend usando API_CONFIG
        const data = await API_CONFIG.api.usuarios.login(email, password);
        
        if (data.token) {
          // Login bem-sucedido
          // Armazenar token JWT
          localStorage.setItem('token', data.token);
          localStorage.setItem('professorLoggedIn', 'true');
          localStorage.setItem('professorEmail', email);
          localStorage.setItem('professorNome', data.usuario.nome);
          localStorage.setItem('userType', data.usuario.tipo);
          localStorage.setItem('professorId', data.usuario._id || data.usuario.id); // Armazenar ID do professor
          
          // Armazenar email se "lembrar-me" estiver marcado
          if (rememberMe) {
            localStorage.setItem('rememberProfessor', 'true');
          } else {
            localStorage.removeItem('rememberProfessor');
          }
          
          // Redirecionar para a página inicial
          window.location.href = '/pages/pagina-inicial.html';
        } else {
          // Login falhou
          showError(data.msg || 'E-mail ou senha incorretos. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
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
  
  // Verificar se há informações salvas de login
  window.addEventListener('load', function() {
    const savedEmail = localStorage.getItem('professorEmail');
    const isLoggedIn = localStorage.getItem('professorLoggedIn');
    const rememberProfessor = localStorage.getItem('rememberProfessor');
    
    // Preencher o email se "lembrar-me" estiver ativado
    if (rememberProfessor === 'true' && savedEmail && document.getElementById('email')) {
      document.getElementById('email').value = savedEmail;
      document.querySelector('input[name="remember"]').checked = true;
    }
    
    // Redirecionar se já estiver logado e estiver na página de login
    if (isLoggedIn === 'true' && window.location.pathname.includes('login-professor')) {
      window.location.href = '/pages/pagina-inicial.html';
    }
  });
});