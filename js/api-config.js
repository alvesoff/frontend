// ===========================
// API-CONFIG.JS
// ===========================

/**
 * Configurações da API do EducaSmart
 */
const API_CONFIG = {
  // URL base da API
  BASE_URL: 'https://api-educasmart.onrender.com',
  
  // Função para obter o token JWT do localStorage
  getToken: function() {
    return localStorage.getItem('token');
  },
  
  // Função para verificar se o usuário está logado
  isLoggedIn: function() {
    return !!this.getToken();
  },
  
  // Função para verificar se o professor está logado
  isProfessorLoggedIn: function() {
    return this.isLoggedIn() && localStorage.getItem('professorLoggedIn') === 'true';
  },
  
  // Headers padrão para requisições autenticadas
  getAuthHeaders: function() {
    return {
      'Content-Type': 'application/json',
      'x-auth-token': this.getToken()
    };
  },
  
  // Headers padrão para requisições não autenticadas
  getHeaders: function() {
    return {
      'Content-Type': 'application/json'
    };
  },
  
  // Função para fazer logout
  logout: function() {
    localStorage.removeItem('token');
    localStorage.removeItem('professorLoggedIn');
    localStorage.removeItem('professorEmail');
    localStorage.removeItem('professorNome');
    window.location.href = '/pages/login-professor.html';
  },
  
  // Funções de API
  api: {
    // Autenticação
    auth: {
      login: async function(email, senha) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/usuarios/login`, {
            method: 'POST',
            headers: API_CONFIG.getHeaders(),
            body: JSON.stringify({ email, senha })
          });
          return await response.json();
        } catch (error) {
          console.error('Erro na autenticação:', error);
          throw error;
        }
      }
    },
    
    // Usuários
    usuarios: {
      login: async function(email, senha) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/usuarios/login`, {
            method: 'POST',
            headers: API_CONFIG.getHeaders(),
            body: JSON.stringify({ email, senha })
          });
          return await response.json();
        } catch (error) {
          console.error('Erro na autenticação:', error);
          throw error;
        }
      },
      
      registro: async function(usuarioData) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/usuarios/registro`, {
            method: 'POST',
            headers: API_CONFIG.getHeaders(),
            body: JSON.stringify(usuarioData)
          });
          return await response.json();
        } catch (error) {
          console.error('Erro no registro:', error);
          throw error;
        }
      }
    },
    
    // Provas
    provas: {
      getAll: async function() {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/provas`, {
            method: 'GET',
            headers: API_CONFIG.getAuthHeaders()
          });
          return await response.json();
        } catch (error) {
          console.error('Erro ao buscar provas:', error);
          throw error;
        }
      },
      
      getById: async function(id) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/provas/${id}`, {
            method: 'GET',
            headers: API_CONFIG.getAuthHeaders()
          });
          return await response.json();
        } catch (error) {
          console.error(`Erro ao buscar prova ${id}:`, error);
          throw error;
        }
      },
      
      getByCodigo: async function(codigo) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/provas/codigo/${codigo}`, {
            method: 'GET',
            headers: API_CONFIG.getHeaders()
          });
          return await response.json();
        } catch (error) {
          console.error(`Erro ao buscar prova com código ${codigo}:`, error);
          throw error;
        }
      },
      
      create: async function(provaData) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/provas`, {
            method: 'POST',
            headers: API_CONFIG.getAuthHeaders(),
            body: JSON.stringify(provaData)
          });
          return await response.json();
        } catch (error) {
          console.error('Erro ao criar prova:', error);
          throw error;
        }
      }
    },
    
    // Resultados
    resultados: {
      getAll: async function() {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/resultados`, {
            method: 'GET',
            headers: API_CONFIG.getAuthHeaders()
          });
          return await response.json();
        } catch (error) {
          console.error('Erro ao buscar resultados:', error);
          throw error;
        }
      },
      
      create: async function(resultadoData) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/resultados`, {
            method: 'POST',
            headers: API_CONFIG.getHeaders(),
            body: JSON.stringify(resultadoData)
          });
          return await response.json();
        } catch (error) {
          console.error('Erro ao salvar resultado:', error);
          throw error;
        }
      }
    }
  }
}