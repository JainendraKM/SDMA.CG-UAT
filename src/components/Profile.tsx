
import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    Name_Of_User: user.Name_Of_User,
    Display_Name: user.Display_Name,
    Designation: user.Designation,
    Mobile_No: user.Mobile_No || '',
    Email_id: user.Email_id || '',
  });
  const [error, setError] = useState<string>('');

  // Sync state if user prop changes
  useEffect(() => {
    setFormData({
      Name_Of_User: user.Name_Of_User,
      Display_Name: user.Display_Name,
      Designation: user.Designation,
      Mobile_No: user.Mobile_No || '',
      Email_id: user.Email_id || '',
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Special handling for Mobile_No to allow only numbers and max 10 digits
    if (name === 'Mobile_No') {
        // Regex to match only digits. If value contains non-digits, ignore the change.
        if (!/^\d*$/.test(value)) {
            return;
        }
        // Limit to 10 digits
        if (value.length > 10) {
            return;
        }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mandatory Validation
    if (!formData.Mobile_No) {
        setError('Mobile Number is required.');
        return;
    }
    // Validate 10 digit number
    if (!/^\d{10}$/.test(formData.Mobile_No)) {
        setError('Mobile Number must be exactly 10 digits.');
        return;
    }

    if (!formData.Email_id) {
        setError('Email ID is required.');
        return;
    }
    // Validate Email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email_id)) {
        setError('Invalid Email ID format.');
        return;
    }

    onUpdate({
      ...user,
      ...formData
    });
    alert('Profile Updated Successfully');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">User Profile</h2>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-6">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {/* User ID - Read Only Label */}
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Userid</label>
                <div className="py-2 px-4 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">
                    {user.User_id}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name_Of_User */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">उपयोगकर्ता का नाम</label>
                    <input
                        type="text"
                        name="Name_Of_User"
                        value={formData.Name_Of_User}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Display_Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">प्रदर्शित नाम</label>
                    <input
                        type="text"
                        name="Display_Name"
                        value={formData.Display_Name}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Designation */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">पदनाम</label>
                    <input
                        type="text"
                        name="Designation"
                        value={formData.Designation}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Mobile_No */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">मोबाईल नं. <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="Mobile_No"
                        value={formData.Mobile_No}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter 10 digit mobile number"
                        maxLength={10}
                    />
                </div>

                {/* Email_id */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">ई मेल आई.डी. <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        name="Email_id"
                        value={formData.Email_id}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter valid email"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end mt-6">
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-lg transform hover:scale-105 transition duration-200"
                >
                    Update Profile
                </button>
            </div>
        </form>
    </div>
  );
};
