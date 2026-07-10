import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides auth state + methods.
 *
 * State:
 *   user             – the logged-in user object (or null)
 *   isAuthenticated  – boolean shorthand
 *   loading          – true while checking for an existing session on mount
 *
 * Methods:
 *   login(email, password)    – POST /api/auth/login
 *   signup(name, email, password) – POST /api/auth/signup
 *   logout()                  – POST /api/auth/logout
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply accessibility settings to the document root element
  const applyAccessibility = (acc) => {
    if (!acc) return;
    const root = document.documentElement;
    // Font size
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px', xl: '21px' };
    root.style.setProperty('--user-font-size', fontSizeMap[acc.fontSize] || '16px');
    // High contrast
    if (acc.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }
    // Dyslexic font
    if (acc.dyslexicFont) {
      root.setAttribute('data-dyslexic', 'true');
    } else {
      root.removeAttribute('data-dyslexic');
    }
    // Reduce motion
    if (acc.reduceMotion) {
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.removeAttribute('data-reduce-motion');
    }
  };

  // On mount — check if there's an existing session (httpOnly cookie)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        applyAccessibility(res.data.user?.accessibility);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    applyAccessibility(res.data.user?.accessibility);
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    return res.data;
  };

  const sendOtp = async (email) => {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  };

  const verifyOtpAndSignup = async (name, email, password, otp) => {
    const res = await api.post('/auth/verify-otp-signup', { name, email, password, otp });
    setUser(res.data.user);
    applyAccessibility(res.data.user?.accessibility);
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      applyAccessibility(res.data.user?.accessibility);
      return res.data.user;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        sendOtp,
        verifyOtpAndSignup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook — access auth context from any component.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
