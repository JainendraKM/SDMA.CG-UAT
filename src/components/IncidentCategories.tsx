
import React, { useState, useEffect } from 'react';
import { masterData } from '../services/data';

// Interfaces for local state management
interface CategoryItem {
  id: number;
  nameEn: string;
  nameHi: string;
  count?: number; 
}

interface SubtypeItem {
  id: number;
  typeId: number;
  nameEn: string;
  nameHi: string;
}

// Storage Keys
const STORAGE_KEYS = {
  DISASTER_LIST: 'cgsdma_disaster_list',
  DAMAGE_LIST: 'cgsdma_damage_list', 
  DISASTER_SUBTYPES: 'cgsdma_disaster_subtypes',
  DAMAGE_SUBTYPES: 'cgsdma_damage_subtypes',
};

export const IncidentCategories: React.FC = () => {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  // --- Local State Initialization (Load from LocalStorage or Fallback to MasterData) ---

  const [disasterSubtypes, setDisasterSubtypes] = useState<SubtypeItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISASTER_SUBTYPES);
    return saved ? JSON.parse(saved) : masterData.disasterSubtypes;
  });

  const [damageSubtypes, setDamageSubtypes] = useState<SubtypeItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAMAGE_SUBTYPES);
    return saved ? JSON.parse(saved) : masterData.damageSubtypes;
  });

  const [disasterList, setDisasterList] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISASTER_LIST);
    if (saved) return JSON.parse(saved);
    // Initial Calculation from masterData if no local storage
    return masterData.disasterTypes.map(dt => ({
      ...dt,
      count: masterData.disasterSubtypes.filter(st => st.typeId === dt.id).length
    }));
  });

  const [damageList, setDamageList] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAMAGE_LIST);
    if (saved) return JSON.parse(saved);
    return masterData.damageTypes.map(dt => ({
      ...dt,
      count: masterData.damageSubtypes.filter(st => st.typeId === dt.id).length
    }));
  });


  // --- Persistence Effect ---
  // Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISASTER_LIST, JSON.stringify(disasterList));
    localStorage.setItem(STORAGE_KEYS.DAMAGE_LIST, JSON.stringify(damageList));   
    localStorage.setItem(STORAGE_KEYS.DISASTER_SUBTYPES, JSON.stringify(disasterSubtypes));
    localStorage.setItem(STORAGE_KEYS.DAMAGE_SUBTYPES, JSON.stringify(damageSubtypes));
  }, [disasterList, damageList, disasterSubtypes, damageSubtypes]);


  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('edit'); 
  
  // Context: editing a main category or a subtype?
  const [editingContext, setEditingContext] = useState<'category' | 'subtype'>('category');
  // If editing category: which type?
  const [editingCategoryType, setEditingCategoryType] = useState<'disaster' | 'damage' | null>(null);
  
  const [selectedItem, setSelectedItem] = useState<CategoryItem | SubtypeItem | null>(null);
  const [formData, setFormData] = useState({ nameHi: '', nameEn: '' });

  // Drill Through State
  const [viewMode, setViewMode] = useState<'list' | 'drilldown'>('list');
  const [drillDownInfo, setDrillDownInfo] = useState<{ title: string; categoryType: 'disaster' | 'damage'; parentId: number } | null>(null);
  
  // List of subtypes currently displayed in Drill Down view
  const [subtypeList, setSubtypeList] = useState<SubtypeItem[]>([]);

  // Update subtypeList view whenever the main lists or view mode changes
  useEffect(() => {
    if (viewMode === 'drilldown' && drillDownInfo) {
        let subtypes: SubtypeItem[] = [];
        if (drillDownInfo.categoryType === 'disaster') {
            subtypes = disasterSubtypes.filter(s => s.typeId === drillDownInfo.parentId);
        } else {
            subtypes = damageSubtypes.filter(s => s.typeId === drillDownInfo.parentId);
        }
        setSubtypeList(subtypes);
    }
  }, [disasterSubtypes, damageSubtypes, viewMode, drillDownInfo]);


  const handleTabChange = (tab: 1 | 2) => {
    setActiveTab(tab);
    setViewMode('list'); // Reset to list view when switching tabs
    setDrillDownInfo(null);
    setSubtypeList([]);
  };

  // --- Handlers ---

  const handleAddCategoryClick = (categoryType: 'disaster' | 'damage') => {
    setModalMode('add');
    setEditingContext('category');
    setEditingCategoryType(categoryType);
    setSelectedItem(null);
    setFormData({ nameHi: '', nameEn: '' });
    setIsEditModalOpen(true);
  };

  const handleAddSubtypeClick = () => {
    setModalMode('add');
    setEditingContext('subtype');
    setSelectedItem(null);
    setFormData({ nameHi: '', nameEn: '' });
    setIsEditModalOpen(true);
  };

  const handleCategoryEditClick = (item: CategoryItem, categoryType: 'disaster' | 'damage') => {
    setModalMode('edit');
    setEditingContext('category');
    setEditingCategoryType(categoryType);
    setSelectedItem(item);
    setFormData({ nameHi: item.nameHi, nameEn: item.nameEn });
    setIsEditModalOpen(true);
  };

  const handleSubtypeEditClick = (item: SubtypeItem) => {
    setModalMode('edit');
    setEditingContext('subtype');
    setSelectedItem(item);
    setFormData({ nameHi: item.nameHi, nameEn: item.nameEn });
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    // Validation
    if (!formData.nameHi || !formData.nameEn) {
        alert("Please enter names in both Hindi and English.");
        return;
    }

    if (modalMode === 'add') {
        // Add New Item Logic
        const newId = Date.now(); // Generate a temp ID
        
        if (editingContext === 'category') {
            const newItem: CategoryItem = {
                id: newId,
                nameHi: formData.nameHi,
                nameEn: formData.nameEn,
                count: 0
            };

            if (editingCategoryType === 'disaster') {
                setDisasterList(prev => [...prev, newItem]);
            } else if (editingCategoryType === 'damage') {
                setDamageList(prev => [...prev, newItem]);
            }
        } else {
            // Adding Subtype
            const parentId = drillDownInfo?.parentId || 0;
            const newSubtype: SubtypeItem = {
                id: newId,
                typeId: parentId,
                nameHi: formData.nameHi,
                nameEn: formData.nameEn
            };

            // Update Global Subtype List & Parent Count
            // Note: subtypeList (View) updates automatically via the useEffect listening to global lists
            if (drillDownInfo?.categoryType === 'disaster') {
                setDisasterSubtypes(prev => [...prev, newSubtype]);
                setDisasterList(prev => prev.map(c => c.id === parentId ? { ...c, count: (c.count || 0) + 1 } : c));
            } else {
                setDamageSubtypes(prev => [...prev, newSubtype]);
                setDamageList(prev => prev.map(c => c.id === parentId ? { ...c, count: (c.count || 0) + 1 } : c));
            }
        }
    } else {
        // Edit Existing Item Logic
        if (!selectedItem) return;
        const updatedItem = { ...selectedItem, nameHi: formData.nameHi, nameEn: formData.nameEn };

        if (editingContext === 'category') {
            if (editingCategoryType === 'disaster') {
                setDisasterList(prev => prev.map(i => i.id === updatedItem.id ? updatedItem as CategoryItem : i));
            } else if (editingCategoryType === 'damage') {
                setDamageList(prev => prev.map(i => i.id === updatedItem.id ? updatedItem as CategoryItem : i));
            }
        } else {
            // Editing Subtype
            if (drillDownInfo?.categoryType === 'disaster') {
                setDisasterSubtypes(prev => prev.map(i => i.id === updatedItem.id ? updatedItem as SubtypeItem : i));
            } else {
                setDamageSubtypes(prev => prev.map(i => i.id === updatedItem.id ? updatedItem as SubtypeItem : i));
            }
        }
    }

    setIsEditModalOpen(false);
  };

  // --- Drill Down Handlers ---

  const handleDrillDown = (item: CategoryItem, categoryType: 'disaster' | 'damage') => {
    // The useEffect will populate the list based on state
    setDrillDownInfo({ title: item.nameHi, categoryType, parentId: item.id });
    setViewMode('drilldown');
  };

  const handleBack = () => {
    setViewMode('list');
    setDrillDownInfo(null);
    setSubtypeList([]);
  };

  // Reusable Icons
  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );

  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">
        घटनाओं की श्रेणी
      </h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
            activeTab === 1
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50 rounded-t-lg'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleTabChange(1)}
        >
          आपदा श्रेणी
        </button>
        <button
          className={`py-2 px-6 font-medium text-sm focus:outline-none transition-colors duration-200 ${
            activeTab === 2
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50 rounded-t-lg'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleTabChange(2)}
        >
          क्षति श्रेणी
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        
        {/* Drill Down View (Shared for Tab 1 & 2) */}
        {viewMode === 'drilldown' && drillDownInfo ? (
          <div className="p-0">
            <div className="flex items-center justify-between bg-blue-50 p-4 border-b border-blue-100">
              <h3 className="font-bold text-lg text-blue-800">
                {drillDownInfo.categoryType === 'disaster' ? 'आपदा श्रेणी' : 'क्षति श्रेणी'} : {drillDownInfo.title} &gt; उप श्रेणी सूची
              </h3>
              <div className="flex gap-2">
                <button 
                    onClick={handleAddSubtypeClick}
                    className="flex items-center gap-2 bg-green-600 text-white border border-green-600 px-4 py-1.5 rounded hover:bg-green-700 text-sm font-medium shadow-sm"
                >
                    <PlusIcon /> नई उप श्रेणी जोड़ें
                </button>
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 bg-white text-blue-600 border border-blue-300 px-4 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium"
                >
                    ← वापस जाएं (Back)
                </button>
              </div>
            </div>
            
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 text-gray-800 text-sm font-bold border-b border-gray-300">
                  <th className="px-6 py-3 text-left border-r border-gray-300 w-20">क्र.</th>
                  <th className="px-6 py-3 text-left border-r border-gray-300">उप श्रेणी का नाम (हिन्‍दी में)</th>
                  <th className="px-6 py-3 text-left border-r border-gray-300">Subtype Name (In English)</th>
                  <th className="px-6 py-3 text-center w-32">संशोधन</th>
                </tr>
              </thead>
              <tbody>
                {subtypeList.length > 0 ? (
                  subtypeList.map((sub, idx) => (
                    <tr key={sub.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-700 border-r border-gray-200">{idx + 1}</td>
                      <td className="px-6 py-3 text-gray-700 border-r border-gray-200 font-medium">{sub.nameHi}</td>
                      <td className="px-6 py-3 text-gray-700 border-r border-gray-200">{sub.nameEn}</td>
                      <td className="px-6 py-3 text-center">
                        <button 
                          onClick={() => handleSubtypeEditClick(sub)}
                          className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                      कोई उप श्रेणी उपलब्ध नहीं है (No subtypes available)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Standard List View */
          <>
            {/* Tab 1: Disaster Types */}
            {activeTab === 1 && (
              <div className="flex flex-col">
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-end">
                    <button 
                        onClick={() => handleAddCategoryClick('disaster')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium shadow-sm"
                    >
                        <PlusIcon /> नई श्रेणी जोड़ें
                    </button>
                </div>
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 text-sm font-bold border-b border-gray-300">
                      <th className="px-6 py-3 text-left border-r border-gray-300 w-20">क्र.</th>
                      <th className="px-6 py-3 text-left border-r border-gray-300">श्रेणी का नाम (हिन्‍दी में)</th>
                      <th className="px-6 py-3 text-left border-r border-gray-300">श्रेणी का नाम (In English)</th>
                      <th className="px-6 py-3 text-center w-40 border-r border-gray-300">उप श्रेणी की संख्‍या</th>
                      <th className="px-6 py-3 text-center w-32">संशोधन</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disasterList.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-700 border-r border-gray-200">{index + 1}</td>
                        <td className="px-6 py-3 text-gray-700 border-r border-gray-200 font-medium">{item.nameHi}</td>
                        <td className="px-6 py-3 text-gray-700 border-r border-gray-200">{item.nameEn}</td>
                        <td className="px-6 py-3 text-gray-700 text-center font-semibold bg-gray-50 border-r border-gray-200">
                          {item.count !== undefined && item.count >= 0 ? (
                            <button 
                              onClick={() => handleDrillDown(item, 'disaster')}
                              className="text-blue-600 hover:text-blue-800 underline font-bold focus:outline-none"
                            >
                              {item.count}
                            </button>
                          ) : (
                            <span className="text-gray-500">0</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button 
                            onClick={() => handleCategoryEditClick(item, 'disaster')}
                            className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Damage Types */}
            {activeTab === 2 && (
              <div className="flex flex-col">
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-end">
                    <button 
                        onClick={() => handleAddCategoryClick('damage')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium shadow-sm"
                    >
                        <PlusIcon /> नई श्रेणी जोड़ें
                    </button>
                </div>
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 text-sm font-bold border-b border-gray-300">
                      <th className="px-6 py-3 text-left border-r border-gray-300 w-20">क्र.</th>
                      <th className="px-6 py-3 text-left border-r border-gray-300">श्रेणी का नाम (हिन्‍दी में)</th>
                      <th className="px-6 py-3 text-left border-r border-gray-300">श्रेणी का नाम (In English)</th>
                      <th className="px-6 py-3 text-center w-40 border-r border-gray-300">उप श्रेणी की संख्‍या</th>
                      <th className="px-6 py-3 text-center w-32">संशोधन</th>
                    </tr>
                  </thead>
                  <tbody>
                    {damageList.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-700 border-r border-gray-200">{index + 1}</td>
                        <td className="px-6 py-3 text-gray-700 border-r border-gray-200 font-medium">{item.nameHi}</td>
                        <td className="px-6 py-3 text-gray-700 border-r border-gray-200">{item.nameEn}</td>
                        <td className="px-6 py-3 text-gray-700 text-center font-semibold bg-gray-50 border-r border-gray-200">
                          {item.count !== undefined && item.count >= 0 ? (
                            <button 
                              onClick={() => handleDrillDown(item, 'damage')}
                              className="text-blue-600 hover:text-blue-800 underline font-bold focus:outline-none"
                            >
                              {item.count}
                            </button>
                          ) : (
                            <span className="text-gray-500">0</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button 
                            onClick={() => handleCategoryEditClick(item, 'damage')}
                            className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal (Shared for Add/Edit Category and Edit Subtype) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto transform transition-all scale-100">
            <div className="bg-blue-800 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold text-xl">
                {modalMode === 'add' 
                    ? `Add New ${editingContext === 'category' ? (editingCategoryType === 'disaster' ? 'Disaster' : 'Damage') : 'Subtype'}`
                    : (editingContext === 'category' ? 'Edit Category Name' : 'Edit Subtype Name')
                }
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {editingContext === 'category' ? 'श्रेणी का नाम (हिन्‍दी में)' : 'उप श्रेणी का नाम (हिन्‍दी में)'}
                </label>
                <input 
                  type="text" 
                  value={formData.nameHi} 
                  onChange={(e) => setFormData({...formData, nameHi: e.target.value})}
                  className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. बाढ़"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {editingContext === 'category' ? 'श्रेणी का नाम (In English)' : 'Subtype Name (In English)'}
                </label>
                <input 
                  type="text" 
                  value={formData.nameEn} 
                  onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Flood"
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-col sm:flex-row-reverse gap-3">
              <button 
                type="button" 
                onClick={handleSave} 
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
              >
                {modalMode === 'add' ? 'Add' : 'Save'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)} 
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
