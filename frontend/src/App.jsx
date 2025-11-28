// frontend/src/App.jsx

import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { connectSocket } from './redux/slices/socketSlice';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';

// Simple Private Route Guard
const PrivateRoute = ({ element: Component, ...rest }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return user ? <Component {...rest} /> : null;
};

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Connect/Disconnect socket based on auth state
  useEffect(() => {
    if (user) {
      dispatch(connectSocket());
    }
  }, [user, dispatch]);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      <Route path="/" element={<PrivateRoute element={ChatPage} />} />
    </Routes>
  );
}

export default App;