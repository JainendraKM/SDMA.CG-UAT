
import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface ChangePasswordProps {
  user: User;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({  }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    captcha: ''
  });
  const [captchaCode, setCaptchaCode] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Basic Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword || !formData.captcha) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    // Standard Password Validation
    // Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(formData.newPassword)) {
      setMessage({ 
        type: 'error', 
        text: 'New Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).' 
      });
      return;
    }

    if (!passwordRegex.test(formData.confirmPassword)) {
      setMessage({ 
        type: 'error', 
        text: 'Confirm Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).' 
      });
      return;
    }

    // Mock Old Password Verification (Assuming 'sadmin' is the current password for demo)
    if (formData.oldPassword !== 'sadmin') {
      setMessage({ type: 'error', text: 'Old Password is incorrect.' });
      return;
    }

    // Captcha Verification
    if (formData.captcha !== captchaCode) {
      setMessage({ type: 'error', text: 'Invalid Captcha Code.' });
      generateCaptcha();
      setFormData(prev => ({ ...prev, captcha: '' }));
      return;
    }

    // New Password Match Verification
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New Password and Confirm Password do not match.' });
      return;
    }

    // Success
    setMessage({ type: 'success', text: 'Password changed successfully!' });
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      captcha: ''
    });
    generateCaptcha();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">Change Password</h2>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        
        {message && (
          <div className={`mb-4 p-3 rounded text-sm text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Old Password</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Old Password"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter New Password"
          />
          <p className="text-xs text-gray-500 mt-1">
            Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm New Password"
          />
          <p className="text-xs text-gray-500 mt-1">
            Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Captcha</label>
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
              name="captcha"
              value={formData.captcha}
              onChange={handleChange}
              className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Captcha Code"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-lg transform hover:scale-105 transition duration-200"
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};
