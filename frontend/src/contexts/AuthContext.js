import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('@TestenotaApp:user');
        const storedToken = localStorage.getItem('@TestenotaApp:token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          api.defaults.headers.authorization = `Bearer ${storedToken}`;
          return true;
        }
        return false;
      } catch (error) {
        console.error('Erro ao carregar autenticação:', error);
        return false;
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password,
        grant_type: 'password',
        username: email // necessário para o OAuth2PasswordRequestForm
      });
      
      const { access_token, user: userData } = response.data;

      localStorage.setItem('@TestenotaApp:token', access_token);
      localStorage.setItem('@TestenotaApp:user', JSON.stringify(userData));

      api.defaults.headers.authorization = `Bearer ${access_token}`;
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro ao fazer login'
      };
    }
  };

  const signUp = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro ao criar conta'
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem('@TestenotaApp:token');
    localStorage.removeItem('@TestenotaApp:user');
    setUser(null);
    delete api.defaults.headers.authorization;
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
