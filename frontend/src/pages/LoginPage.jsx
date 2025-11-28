// frontend/src/pages/LoginPage.jsx (Corrected with visual fix)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Ensure 'error' is pulled from state for display
  const { user, isLoading, error } = useSelector((state) => state.auth); 

  useEffect(() => {
    // This correctly triggers a redirect if the user object is set in Redux
    if (user) {
      navigate('/'); 
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Login to Chat App</h2>
      {/* If error is an object, try to display its message property */}
      {error && <p className="text-red-500 text-sm text-center">{error.message || String(error)}</p>}
      
      <div>
        <label className="text-sm font-medium">Email</label>
        <Input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Password</label>
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>
      
      <Button 
        type="submit" 
        // --- VISUAL FIX: Force Blue Color and White Text ---
        className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Login'}
      </Button>
      
      <p className="text-center text-sm">
        Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
      </p>
    </form>
  );
};

export default LoginPage;