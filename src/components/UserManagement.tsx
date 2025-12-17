
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { users as initialUsers, districts } from '../services/data';

export const UserManagement: React.FC = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Simulate query: SELECT D.Dist_Name_Hi, ... FROM User_Accounts UA Inner Join Districts D
    // Filter users who have a valid Dist_Code matching a district
    const districtUsers = initialUsers.filter(u => {
        return u.Dist_Code && districts.find(d => d.Dist_Code === u.Dist_Code);
    });
    setUserList(districtUsers);
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
        Name_Of_User: user.Name_Of_User,
        Designation: user.Designation,
        Display_Name: user.Display_Name,
        Mobile_No: user.Mobile_No || '',
        Email_id: user.Email_id || ''
    });
    setError('');
    setIsModalOpen(true);
  };

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

      setFormData({...formData, [name]: value});
      if (error) setError('');
  }

  const handleSave = () => {
      if(!selectedUser) return;
      
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

      const updatedList = userList.map(u => {
          if(u.User_id === selectedUser.User_id) {
              return { ...u, ...formData } as User;
          }
          return u;
      });
      setUserList(updatedList);
      setIsModalOpen(false);
      // In a real application, you would make an API call to save changes here.
      alert('User details updated successfully!');
  }

  return (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500 pb-2">उपयोगकर्ता प्रबंधन</h2>
        <div className="overflow-x-auto bg-white rounded shadow-lg border border-gray-200">
            <table className="min-w-full leading-normal border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-gray-800 text-sm font-bold">
                        <th className="px-4 py-3 border border-gray-300 text-left">क्र.</th>
                        <th className="px-4 py-3 border border-gray-300 text-left">जिला</th>
                        <th className="px-4 py-3 border border-gray-300 text-left">उपयोगकर्ता आई.डी.</th>
                        <th className="px-4 py-3 border border-gray-300 text-left">उपयोगकर्ता का नाम</th>
                        <th className="px-4 py-3 border border-gray-300 text-left">पदनाम</th>
                        <th className="px-4 py-3 border border-gray-300 text-left">प्रदर्शित नाम</th>
                        <th className="px-4 py-3 border border-gray-300 text-left">मोबाइल नं.</th>
                        <th className="px-4 py-3 border border-gray-300 text-left">ई - मेल आई.डी.</th>
                        <th className="px-4 py-3 border border-gray-300 text-center">संशोधन</th>
                    </tr>
                </thead>
                <tbody>
                    {userList.map((user, index) => {
                        const distName = districts.find(d => d.Dist_Code === user.Dist_Code)?.Dist_Name_Hi || '';
                        return (
                            <tr key={user.User_id} className="hover:bg-blue-50 text-sm text-gray-700 transition-colors">
                                <td className="px-4 py-2 border border-gray-300">{index + 1}</td>
                                <td className="px-4 py-2 border border-gray-300 font-medium">{distName}</td>
                                <td className="px-4 py-2 border border-gray-300">{user.User_id}</td>
                                <td className="px-4 py-2 border border-gray-300">{user.Name_Of_User}</td>
                                <td className="px-4 py-2 border border-gray-300">{user.Designation}</td>
                                <td className="px-4 py-2 border border-gray-300">{user.Display_Name}</td>
                                <td className="px-4 py-2 border border-gray-300">{user.Mobile_No}</td>
                                <td className="px-4 py-2 border border-gray-300">{user.Email_id}</td>
                                <td className="px-4 py-2 border border-gray-300 text-center">
                                    <button 
                                        type="button"
                                        onClick={() => handleEditClick(user)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-xs font-semibold shadow transition-transform hover:scale-105"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Modal */}
        {isModalOpen && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto transform transition-all scale-100">
                    <div className="bg-blue-800 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold text-xl">Update User Details</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-4">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">उपयोगकर्ता आई.डी.</label>
                            <input type="text" value={selectedUser.User_id} disabled className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-500 bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">उपयोगकर्ता का नाम</label>
                            <input type="text" name="Name_Of_User" value={formData.Name_Of_User || ''} onChange={handleChange} className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">पदनाम</label>
                            <input type="text" name="Designation" value={formData.Designation || ''} onChange={handleChange} className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">प्रदर्शित नाम</label>
                            <input type="text" name="Display_Name" value={formData.Display_Name || ''} onChange={handleChange} className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">मोबाइल नं. <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="Mobile_No" 
                                value={formData.Mobile_No || ''} 
                                onChange={handleChange} 
                                placeholder="Enter 10 digit mobile number" 
                                className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                maxLength={10}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">ई - मेल आई.डी. <span className="text-red-500">*</span></label>
                            <input type="text" name="Email_id" value={formData.Email_id || ''} onChange={handleChange} placeholder="Enter valid email" className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-col sm:flex-row-reverse gap-3">
                        <button type="button" onClick={handleSave} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm">
                            Update
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
