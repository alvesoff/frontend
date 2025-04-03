// profile-dropdown.js
// Script para gerenciar o dropdown do perfil do usuário

document.addEventListener('DOMContentLoaded', function() {
  // Selecionar elementos do dropdown
  const userProfile = document.getElementById('userProfile');
  const profileDropdown = document.getElementById('profileDropdown');
  const logoutItem = document.querySelector('.logout-item');
  
  // Verificar se o usuário está logado
  const isLoggedIn = localStorage.getItem('professorLoggedIn') === 'true';
  const professorEmail = localStorage.getItem('professorEmail');
  
  // Atualizar informações do usuário no dropdown se estiver logado
  if (isLoggedIn && profileDropdown) {
    const emailElement = profileDropdown.querySelector('.dropdown-header p');
    if (emailElement && professorEmail) {
      emailElement.textContent = professorEmail;
    }
  }
  
  // Alternar visibilidade do dropdown ao clicar no ícone de usuário
  if (userProfile) {
    userProfile.addEventListener('click', function(e) {
      e.stopPropagation(); // Evitar que o clique se propague para o documento
      profileDropdown.classList.toggle('show');
    });
  }
  
  // Fechar dropdown ao clicar em qualquer lugar fora dele
  document.addEventListener('click', function(e) {
    if (profileDropdown && profileDropdown.classList.contains('show') && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove('show');
    }
  });
  
  // Gerenciar logout
  if (logoutItem) {
    logoutItem.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Limpar dados de login
      localStorage.removeItem('professorLoggedIn');
      
      // Redirecionar para a página de login
      window.location.href = '/pages/login-professor.html';
    });
  }
});