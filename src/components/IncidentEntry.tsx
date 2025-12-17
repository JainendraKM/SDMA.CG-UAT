
import React, { useState } from 'react';
import type { User, Incident } from '../types';
import { districts, tehsils, masterData } from '../services/data';
import Swal from 'sweetalert2';

interface IncidentEntryProps {
  user: User;
  onSave: (incident: Incident) => void;
}

export const IncidentEntry: React.FC<IncidentEntryProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState<Partial<Incident>>({
    Dist_Code: user.Dist_Code || 0,
    Inc_Year: 2024,
    Inc_Month: new Date().getMonth() + 1,
    DM_Qty: 0,
    Is_Deleted: false,
    Camp_Name: '',
    No_Of_Camps: 0,
    No_Of_Peoples: 0
  });

  const districtName = districts.find(d => d.Dist_Code === user.Dist_Code)?.Dist_Name_Hi || '';
  const availableTehsils = tehsils.filter(t => t.Dist_Code === user.Dist_Code);
  
  // Dependent Dropdowns Logic
  const availableDisasterSubtypes = masterData.disasterSubtypes.filter(s => s.typeId === formData.DS_type_id);
  const availableDamageSubtypes = masterData.damageSubtypes.filter(s => s.typeId === formData.DM_type_id);

  // Check if selected disaster type is Flood (ID 1)
  const isFloodCategory = formData.DS_type_id === 1;

  // Logic for Quantity Label
  const getQuantityLabel = () => {
    if (formData.DM_type_id === 4) {
      return "फसल क्षति (हेक्‍टेयर में)";
    }
    // Check if subtype is Road (ID 9 based on masterData)
    if (formData.DM_Subtype_id === 9) {
      return "किलोमीटर";
    }
    return "संख्‍या";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.Teh_Code || !formData.DS_type_id) {
      Swal.fire({
        icon: 'error',
        title: 'त्रुटि (Error)',
        text: 'कृपया आवश्यक फ़ील्ड भरें (Please fill required fields)',
      });
      return;
    }
    
    // Generate mock ID
    const newIncident: Incident = {
      ...formData as Incident,
      Inc_id: Math.floor(Math.random() * 10000),
    };
    
    onSave(newIncident);
    
    // Show SweetAlert Success Message
    Swal.fire({
      title: 'सफल! (Success)',
      text: 'जानकारी सुरक्षित कर ली गई है (Data Saved Successfully)!',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563EB' // Matches blue-600
    });
    
    // Reset form
    setFormData({
      Dist_Code: user.Dist_Code || 0,
      Inc_Year: 2024,
      Inc_Month: new Date().getMonth() + 1,
      Teh_Code: undefined,
      DS_type_id: undefined, 
      DS_Subtype_id: undefined,
      DM_type_id: undefined, 
      DM_Subtype_id: undefined,
      DM_Qty: 0,
      Is_Deleted: false,
      Camp_Name: '',
      No_Of_Camps: 0,
      No_Of_Peoples: 0
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* 1. Center Heading & District Name */}
      <div className="text-center mb-8 space-y-3">
        <h4 className="text-2xl font-bold text-blue-900 drop-shadow-sm">
          घटना की प्रविष्टि
        </h4>
        <div className="inline-block bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-full px-8 py-2 shadow-sm">
          <h3 className="text-xl font-bold text-blue-800 tracking-wide">
            जिला – {districtName}
          </h3>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-xl border border-blue-100 overflow-hidden">
          
        <div className="p-6 md:p-8 space-y-8">
          
          {/* General Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tehsil */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                तहसील <span className="text-red-500">*</span>
              </label>
              <select 
                className="form-select w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors"
                value={formData.Teh_Code || ''}
                onChange={e => setFormData({...formData, Teh_Code: Number(e.target.value)})}
                required
              >
                <option value="">चुनें</option>
                {availableTehsils.map(t => (
                  <option key={t.Teh_Code} value={t.Teh_Code}>{t.Teh_Name_Hi}</option>
                ))}
              </select>
            </div>

            {/* Incident Year */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                घटना वर्ष
              </label>
              <select 
                className="form-select w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors"
                value={formData.Inc_Year}
                onChange={e => setFormData({...formData, Inc_Year: Number(e.target.value)})}
              >
                {[2020, 2021, 2022, 2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Incident Month */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                घटना माह
              </label>
              <select 
                className="form-select w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors"
                value={formData.Inc_Month}
                onChange={e => setFormData({...formData, Inc_Month: Number(e.target.value)})}
              >
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                  <option key={i} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Disaster Details Section */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-bold text-blue-800 mb-6 flex items-center">
              <span className="bg-blue-200 text-blue-800 p-1.5 rounded mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </span>
              आपदा विवरण
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Disaster Category */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium">
                  आपदा श्रेणी <span className="text-red-500">*</span>
                </label>
                <select 
                  className="form-select w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
                  value={formData.DS_type_id || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    DS_type_id: Number(e.target.value), 
                    DS_Subtype_id: null,
                    Camp_Name: Number(e.target.value) !== 1 ? '' : formData.Camp_Name,
                    No_Of_Camps: Number(e.target.value) !== 1 ? 0 : formData.No_Of_Camps,
                    No_Of_Peoples: Number(e.target.value) !== 1 ? 0 : formData.No_Of_Peoples,
                  })}
                  required
                >
                  <option value="">चुनें</option>
                  {masterData.disasterTypes.map(d => <option key={d.id} value={d.id}>{d.nameHi}</option>)}
                </select>
              </div>

              {/* Disaster Subtype (Conditional) */}
              {availableDisasterSubtypes.length > 0 && (
                <div className="flex flex-col gap-2 animate-fade-in-down">
                  <label className="text-gray-700 font-medium">
                    आपदा उप श्रेणी
                  </label>
                  <select 
                    className="form-select w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
                    value={formData.DS_Subtype_id || ''}
                    onChange={e => setFormData({...formData, DS_Subtype_id: Number(e.target.value)})}
                  >
                    <option value="">चुनें</option>
                    {availableDisasterSubtypes.map(d => <option key={d.id} value={d.id}>{d.nameHi}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Damage Details Section */}
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
            <h3 className="text-lg font-bold text-orange-800 mb-6 flex items-center">
              <span className="bg-orange-200 text-orange-800 p-1.5 rounded mr-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </span>
              क्षति विवरण
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Damage Category */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium">
                  क्षति श्रेणी
                </label>
                <select 
                  className="form-select w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 shadow-sm"
                  value={formData.DM_type_id || ''}
                  onChange={e => setFormData({...formData, DM_type_id: Number(e.target.value), DM_Subtype_id: null})}
                >
                  <option value="">चुनें</option>
                  {masterData.damageTypes.map(d => <option key={d.id} value={d.id}>{d.nameHi}</option>)}
                </select>
              </div>

              {/* Damage Subtype (Conditional) */}
              {availableDamageSubtypes.length > 0 && (
                <div className="flex flex-col gap-2 animate-fade-in-down">
                  <label className="text-gray-700 font-medium">
                    क्षति उप श्रेणी
                  </label>
                  <select 
                    className="form-select w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 shadow-sm"
                    value={formData.DM_Subtype_id || ''}
                    onChange={e => setFormData({...formData, DM_Subtype_id: Number(e.target.value)})}
                  >
                    <option value="">चुनें</option>
                    {availableDamageSubtypes.map(d => <option key={d.id} value={d.id}>{d.nameHi}</option>)}
                  </select>
                </div>
              )}

              {/* Quantity - Dynamic Label */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium">
                  {getQuantityLabel()}
                </label>
                <input 
                  type="number" 
                  className="form-input w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 shadow-sm"
                  value={formData.DM_Qty}
                  onChange={e => setFormData({...formData, DM_Qty: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Flood Relief Camp Information (Conditional) */}
          {isFloodCategory && (
            <div className="animate-fade-in-down bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-bold text-green-800 mb-6 flex items-center">
                <span className="bg-green-200 text-green-800 p-1.5 rounded mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </span>
                बाढ़ राहत शिविर की जानकारी
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Camp Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium">
                    शिविर का नाम
                  </label>
                  <input 
                    type="text" 
                    className="form-input w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 shadow-sm"
                    value={formData.Camp_Name || ''}
                    onChange={e => setFormData({...formData, Camp_Name: e.target.value})}
                    placeholder="Enter Camp Name"
                  />
                </div>

                {/* Number of Camps */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium">
                    शिविर संख्‍या
                  </label>
                  <input 
                    type="number" 
                    className="form-input w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 shadow-sm"
                    value={formData.No_Of_Camps || 0}
                    onChange={e => setFormData({...formData, No_Of_Camps: Number(e.target.value)})}
                  />
                </div>

                {/* Number of People */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium">
                    ठहराये गये व्‍यक्तियों की संख्‍या
                  </label>
                  <input 
                    type="number" 
                    className="form-input w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 shadow-sm"
                    value={formData.No_Of_Peoples || 0}
                    onChange={e => setFormData({...formData, No_Of_Peoples: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Submit */}
        <div className="bg-gray-50 px-6 py-6 border-t border-gray-200 flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            सुरक्षित करें
          </button>
        </div>

      </form>
    </div>
  );
};
