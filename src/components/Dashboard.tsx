
import React from 'react';
import type { Incident, User } from '../types';
import { Chart } from "react-google-charts";

interface DashboardProps {
  user: User;
  incidents: Incident[];
  year: number;
  setYear: (year: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, incidents, year, setYear }) => {
  // Filter incidents based on User Role and Selected Year (Matches SQL Where Clause)
  const filteredIncidents = incidents.filter(inc => {
    const yearMatch = inc.Inc_Year === year;
    const deletedMatch = inc.Is_Deleted === false;
    const districtMatch = user.Dist_Code ? inc.Dist_Code === user.Dist_Code : true;
    return yearMatch && deletedMatch && districtMatch;
  });

  // Aggregation Logic based on SQL Queries provided:
  // SUM(Case When DM_type_id = X Then DM_Qty Else 0 End)
  const stats = {
    lossOfLife: filteredIncidents.reduce((sum, inc) => inc.DM_type_id === 1 ? sum + (inc.DM_Qty || 0) : sum, 0),
    houseDamage: filteredIncidents.reduce((sum, inc) => inc.DM_type_id === 2 ? sum + (inc.DM_Qty || 0) : sum, 0),
    animalLoss: filteredIncidents.reduce((sum, inc) => inc.DM_type_id === 3 ? sum + (inc.DM_Qty || 0) : sum, 0),
    cropDamage: filteredIncidents.reduce((sum, inc) => inc.DM_type_id === 4 ? sum + (inc.DM_Qty || 0) : sum, 0),
    // GPL: DM_type_id = 5 AND DM_Subtype_id <> 9
    gplLoss: filteredIncidents.reduce((sum, inc) => (inc.DM_type_id === 5 && inc.DM_Subtype_id !== 9) ? sum + (inc.DM_Qty || 0) : sum, 0),
    // Road: DM_Subtype_id = 9 (Road subtype)
    roadDamage: filteredIncidents.reduce((sum, inc) => (inc.DM_Subtype_id === 9) ? sum + (inc.DM_Qty || 0) : sum, 0),
  };

  // Prepare data for Pie Chart
  // Filter out zero values first to ensure colors match correctly
  const rawPieData = [
    { name: 'जनहानि', value: stats.lossOfLife, color: '#DC2626' }, // red-600
    { name: 'मकान क्षति', value: stats.houseDamage, color: '#EA580C' }, // orange-600
    { name: 'पशु हानि', value: stats.animalLoss, color: '#A16207' }, // yellow-700
    { name: 'फसल क्षति', value: stats.cropDamage, color: '#15803D' }, // green-700
    { name: 'शासकीय परिसंपत्ति', value: stats.gplLoss, color: '#4338CA' }, // indigo-700
    { name: 'सड़क क्षति', value: stats.roadDamage, color: '#374151' }, // gray-700
  ].filter(item => item.value > 0);

  // Google Charts Data Format: Array of Arrays [Header, ...Data]
  const chartData = [
    ["Category", "Value"],
    ...rawPieData.map(item => [item.name, item.value])
  ];

  const chartOptions = {
    title: "", // Handled by external header
    is3D: true,
    backgroundColor: "transparent",
    colors: rawPieData.map(item => item.color),
    legend: { position: "right", textStyle: { fontSize: 14 } },
    chartArea: { width: '90%', height: '90%' },
    pieSliceText: 'percentage',
    tooltip: { showColorCode: true },
    fontSize: 14,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Welcome : <span className="text-blue-600">{user.Display_Name}</span></h3>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-base font-medium border border-blue-100 hidden sm:block">
            वर्ष
          </div>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="form-select block w-32 pl-3 pr-8 py-2 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base rounded-lg border border-gray-300 bg-gray-50 hover:bg-white transition-colors cursor-pointer text-gray-700 font-semibold shadow-sm"
          >
            {[2020, 2021, 2022, 2023, 2024, 2025].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dashboard Title with Dotted Lines */}
      <div className="flex items-center justify-center relative my-4">
         <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t-2 border-dotted border-gray-400"></div>
         </div>
         <div className="relative bg-gray-50 px-6">
            <h1 className="text-3xl font-bold text-gray-900">डैशबोर्ड</h1>
         </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 max-w-7xl mx-auto">
        
        {/* Human Loss Card */}
        <div className="bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border border-blue-600 flex items-center p-4 hover:shadow-lg transition-shadow cursor-default">
            <div className="bg-red-100 p-3 rounded-full mr-4">
                 <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <div className="text-base text-gray-500 font-medium uppercase tracking-wider">जनहानि</div>
              <div className="text-2xl font-bold text-gray-800">{stats.lossOfLife}</div>
            </div>
        </div>

        {/* House Damage Card */}
        <div className="bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border border-blue-600 flex items-center p-4 hover:shadow-lg transition-shadow cursor-default">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
                 <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <div>
              <div className="text-base text-gray-500 font-medium uppercase tracking-wider">मकान क्षति</div>
              <div className="text-2xl font-bold text-gray-800">{stats.houseDamage}</div>
            </div>
        </div>

         {/* Animal Loss Card */}
         <div className="bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border border-blue-600 flex items-center p-4 hover:shadow-lg transition-shadow cursor-default">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
                 <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <div className="text-base text-gray-500 font-medium uppercase tracking-wider">पशु हानि</div>
              <div className="text-2xl font-bold text-gray-800">{stats.animalLoss}</div>
            </div>
        </div>

        {/* Crop Damage Card */}
        <div className="bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border border-blue-600 flex items-center p-4 hover:shadow-lg transition-shadow cursor-default">
            <div className="bg-green-100 p-3 rounded-full mr-4">
                 <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
            </div>
            <div>
              <div className="text-base text-gray-500 font-medium uppercase tracking-wider">फसल क्षति (हेक्‍टेयर में)</div>
              <div className="text-2xl font-bold text-gray-800">{stats.cropDamage}</div>
            </div>
        </div>

        {/* Government Asset Loss (GPL) Card */}
        <div className="bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border border-blue-600 flex items-center p-4 hover:shadow-lg transition-shadow cursor-default">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
                 <svg className="w-8 h-8 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <div className="text-base text-gray-500 font-medium uppercase tracking-wider">शासकीय परिसंपत्ति हानि</div>
              <div className="text-2xl font-bold text-gray-800">{stats.gplLoss}</div>
            </div>
        </div>

        {/* Road Damage Card (Added) */}
        <div className="bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border border-blue-600 flex items-center p-4 hover:shadow-lg transition-shadow cursor-default">
            <div className="bg-gray-100 p-3 rounded-full mr-4">
                 <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                 </svg>
            </div>
            <div>
              <div className="text-base text-gray-500 font-medium uppercase tracking-wider">सड़क क्षति (कि.मी. में)</div>
              <div className="text-2xl font-bold text-gray-800">{stats.roadDamage}</div>
            </div>
        </div>

      </div>

      {/* Pie Chart Section */}
      <div className="max-w-7xl mx-auto mt-12 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">
                क्षति का ग्राफिकल विश्लेषण (Graphical Analysis)
            </h3>
        </div>
        <div className="p-6">
            {chartData.length > 1 ? (
                <div style={{ width: '100%', height: 400 }}>
                    <Chart
                        chartType="PieChart"
                        width="100%"
                        height="100%"
                        data={chartData}
                        options={chartOptions}
                    />
                </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                    ग्राफ के लिए पर्याप्त डेटा उपलब्ध नहीं है (No data available for chart)
                </div>
            )}
        </div>
      </div>
      
    </div>
  );
};
