
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { users } from '../services/data';
import { Header } from './Header';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');

  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId || !password) {
      setError('Please enter User ID and Password');
      return;
    }
    
    if (captchaInput !== captchaCode) {
      setError('Invalid Captcha Code');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    const user = users.find(u => u.User_id === userId);
    
    if (user && password === 'sadmin') { // Mock password check
      onLogin(user);
    } else {
      setError('Invalid Credentials');
      generateCaptcha();
      setCaptchaInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-[Inter]">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Back Button */}
        <div className="w-full max-w-md mb-4 flex justify-start">
            <button 
                onClick={onBack}
                className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-2 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100 hover:shadow-md"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                होम पेज पर वापस जाएं (Back to Home)
            </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4">
            <h2 className="text-white text-xl font-bold text-center">Login</h2>
          </div>
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 font-medium mb-1">User ID</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Captcha</label>
              <div className="flex gap-2">
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded font-mono font-bold tracking-widest select-none flex items-center gap-2">
                  <span className="text-lg">{captchaCode}</span>
                  <button 
                    type="button" 
                    onClick={generateCaptcha}
                    className="text-gray-500 hover:text-blue-600 focus:outline-none"
                    title="Refresh Captcha"
                  >
                    ↻
                  </button>
                </div>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter Code"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded transition duration-200"
            >
              Login
            </button>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Default Password: sadmin</p>
              <p>Sample IDs: sadmin (Admin), BAS374 (District)</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
