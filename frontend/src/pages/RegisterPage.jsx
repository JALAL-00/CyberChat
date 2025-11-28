import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const validateRegistration = (data) => {
    const { firstName, lastName, email, password } = data;
    
    if (!firstName || !lastName || !email || !password) {
        return 'Please fill in all fields.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address.';
    }

    // UPDATED PASSWORD REGEX AND MESSAGE
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s])[A-Za-z\d\W\s]{8,}$/;
    if (password.length < 8 || !passwordRegex.test(password)) {
        return 'Password must be at least 8 characters, including uppercase, lowercase, number, and special character.';
    }

    return null;
};

const RegisterPage = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [localError, setLocalError] = useState(null); 
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isLoading, error: authError } = useSelector((state) => state.auth); 

    useEffect(() => {
        if (user) {
            navigate('/'); 
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setLocalError(null); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validationError = validateRegistration(formData);
        if (validationError) {
            setLocalError(validationError);
            return;
        }
        
        dispatch(register(formData));
    };

    const displayError = localError || (authError ? (authError.message || String(authError)) : null);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Register for Chat App</h2>
            {displayError && <p className="text-red-500 text-sm text-center">{displayError}</p>} 

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                </div>
            </div>
            
            <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>
            
            <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>
            
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Register'}
            </Button>
            
            <p className="text-center text-sm">
                Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
            </p>
        </form>
    );
};

export default RegisterPage;
