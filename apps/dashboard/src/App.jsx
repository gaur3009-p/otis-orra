import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Customize from './pages/Customize';
import Leads from './pages/Leads';
import Deploy from './pages/Deploy';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('orra_token');
    const business = localStorage.getItem('orra_business');
    return token ? { token, business: business ? JSON.parse(business) : {} } : null;
  });

  const login = (token, business) => {
    localStorage.setItem('orra_token', token);
    localStorage.setItem('orra_business', JSON.stringify(business));
    setAuth({ token, business });
  };

  const logout = () => {
    localStorage.removeItem('orra_token');
    localStorage.removeItem('orra_business');
    setAuth(null);
  };

  return (
    <AuthCtx.Provider value={{ auth, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={auth ? <Navigate to="/onboarding" replace /> : <Login />} />
          <Route path="/" element={auth ? <Navigate to="/onboarding" replace /> : <Navigate to="/login" replace />} />
          <Route element={auth ? <Layout /> : <Navigate to="/login" replace />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/deploy" element={<Deploy />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}
