// ===========================
// API-CONFIG.JS
// ===========================

/**
 * Configurações da API do EducaSmart
 */
const API_CONFIG = {
  // URL base da API
  BASE_URL: 'https://api-educasmart.onrender.com',
  // URL base da API de questões
  QUESTOES_API_URL: 'https://api-quest-xf6a.onrender.com',
  
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
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro na autenticação');
          }
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
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro na autenticação');
          }
          return await response.json();
        } catch (error) {
          console.error('Erro na autenticação:', error);
          throw error;
        }
      },
      
      registro: async function(usuarioData) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/usuarios/registro`, {
            method: 'POST',
            headers: API_CONFIG.getHeaders(),
            body: JSON.stringify(usuarioData)
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro no registro');
          }
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
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/provas`, {
            method: 'GET',
            headers: API_CONFIG.getAuthHeaders()
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao buscar provas');
          }
          const data = await response.json();
          return data.data || [];
        } catch (error) {
          console.error('Erro ao buscar provas:', error);
          throw error;
        }
      },
      
      getById: async function(id) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/provas/${id}`, {
            method: 'GET',
            headers: API_CONFIG.getAuthHeaders()
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || `Erro ao buscar prova ${id}`);
          }
          const data = await response.json();
          return data.data || null;
        } catch (error) {
          console.error(`Erro ao buscar prova ${id}:`, error);
          throw error;
        }
      },
      
      getByCodigo: async function(codigo) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/provas/codigo/${codigo}`, {
            method: 'GET',
            headers: API_CONFIG.getHeaders()
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || `Erro ao buscar prova com código ${codigo}`);
          }
          const data = await response.json();
          return data.data || null;
        } catch (error) {
          console.error(`Erro ao buscar prova com código ${codigo}:`, error);
          throw error;
        }
      },
      
      create: async function(provaData) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/provas`, {
            method: 'POST',
            headers: API_CONFIG.getAuthHeaders(),
            body: JSON.stringify(provaData)
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao criar prova');
          }
          const data = await response.json();
          return data.data || null;
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
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/resultados`, {
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
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/resultados`, {
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
    },

    // Questões
    questoes: {
      getAll: async function(filtros = {}) {
        try {
          let url = `${API_CONFIG.QUESTOES_API_URL}/api/questoes`;
          const queryParams = new URLSearchParams();
          
          if (filtros.disciplina) queryParams.append('disciplina', filtros.disciplina);
          if (filtros.anoEscolar) queryParams.append('anoEscolar', filtros.anoEscolar);
          if (filtros.dificuldade) queryParams.append('dificuldade', filtros.dificuldade);
          if (filtros.tags) queryParams.append('tags', filtros.tags);
          if (filtros.termo) queryParams.append('termo', filtros.termo);
          
          if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
          }
          
          const response = await fetch(url, {
            method: 'GET',
            headers: API_CONFIG.getHeaders()
          });
          return await response.json();
        } catch (error) {
          console.error('Erro ao buscar questões:', error);
          throw error;
        }
      },

      getById: async function(id) {
        try {
          const response = await fetch(`${API_CONFIG.QUESTOES_API_URL}/api/questoes/${id}`, {
            method: 'GET',
            headers: API_CONFIG.getHeaders()
          });
          return await response.json();
        } catch (error) {
          console.error(`Erro ao buscar questão ${id}:`, error);
          throw error;
        }
      },

      create: async function(questaoData) {
        try {
          const response = await fetch(`${API_CONFIG.QUESTOES_API_URL}/api/v1/questoes`, {
            method: 'POST',
            headers: API_CONFIG.getAuthHeaders(),
            body: JSON.stringify(questaoData)
          });
          return await response.json();
        } catch (error) {
          console.error('Erro ao criar questão:', error);
          throw error;
        }
      }
    }
  }
}