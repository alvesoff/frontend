// ===========================
// PROTECT-CADASTRO.JS
// ===========================

/**
 * Script para proteger a página de cadastro de professor
 * Apenas administradores podem acessar esta página
 */

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se o usuário está logado como administrador
  const isLoggedIn = API_CONFIG.isLoggedIn();
  const userType = localStorage.getItem('userType');
  
  console.log('Status de login:', isLoggedIn);
  console.log('Tipo de usuário:', userType);
  
  // Se não houver nenhum administrador cadastrado, permitir o primeiro cadastro
  const hasAdmin = API_CONFIG.checkAdminExists();
  
  // Se não estiver logado ou não for administrador, redirecionar para a página inicial
  if ((!isLoggedIn || userType !== 'admin') && hasAdmin) {
    // Exibir mensagem de acesso negado
    alert('Acesso negado. Apenas administradores podem acessar esta página.');
    
    // Redirecionar para a página de login
    window.location.href = '/pages/login-professor.html';
    return; // Interromper a execução do script
  } else {
    console.log('Acesso permitido: usuário é administrador');
  }
});