
import React, { useMemo, useState } from 'react';
import { Chart } from "react-google-charts";
import { districts } from '../services/data';
import type { Incident } from '../types';

interface DistrictDamageChartProps {
  incidents: Incident[];
  year: number;
  onYearChange: (year: number) => void;
}

// Configuration for chart series (keys, labels, colors)
const SERIES_CONFIG = [
  { key: 'lossOfLife', label: 'जनहानि', color: '#DC2626' },
  { key: 'houseDamage', label: 'मकान क्षति', color: '#EA580C' },
  { key: 'animalLoss', label: 'पशु हानि', color: '#A16207' },
  { key: 'cropDamage', label: 'फसल क्षति', color: '#15803D' },
  { key: 'gplLoss', label: 'शासकीय परिसंपत्ति', color: '#4338CA' },
  { key: 'roadDamage', label: 'सड़क क्षति', color: '#374151' },
];

export const DistrictDamageChart: React.FC<DistrictDamageChartProps> = ({ incidents, year, onYearChange }) => {
  
  // State to manage visibility of each series
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    lossOfLife: true,
    houseDamage: true,
    animalLoss: true,
    cropDamage: true,
    gplLoss: true,
    roadDamage: true,
  });

  const toggleSeries = (key: string) => {
    setVisibleSeries(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const { chartData, currentColors } = useMemo(() => {
    // 1. Filter Valid Incidents for the selected year
    const validIncidents = incidents.filter(inc => 
      inc.Inc_Year === year && !inc.Is_Deleted
    );

    // 2. Aggregate Data by District Code (Grouping) - Simulating the Subquery
    const districtAggregates: Record<number, any> = {};

    validIncidents.forEach(inc => {
      const dCode = inc.Dist_Code;
      if (!districtAggregates[dCode]) {
        districtAggregates[dCode] = {
          lossOfLife: 0, houseDamage: 0, animalLoss: 0, 
          cropDamage: 0, gplLoss: 0, roadDamage: 0
        };
      }

      // Summation Logic (Case When ...)
      if (inc.DM_type_id === 1) districtAggregates[dCode].lossOfLife += (inc.DM_Qty || 0);
      if (inc.DM_type_id === 2) districtAggregates[dCode].houseDamage += (inc.DM_Qty || 0);
      if (inc.DM_type_id === 3) districtAggregates[dCode].animalLoss += (inc.DM_Qty || 0);
      if (inc.DM_type_id === 4) districtAggregates[dCode].cropDamage += (inc.DM_Qty || 0);
      // GPL: Type 5 AND Subtype NOT 9
      if (inc.DM_type_id === 5 && inc.DM_Subtype_id !== 9) districtAggregates[dCode].gplLoss += (inc.DM_Qty || 0);
      // Road: Subtype 9
      if (inc.DM_type_id === 5 && inc.DM_Subtype_id === 9) districtAggregates[dCode].roadDamage += (inc.DM_Qty || 0);
    });

    // 3. Prepare Dynamic Header and Colors based on selection
    const activeSeries = SERIES_CONFIG.filter(s => visibleSeries[s.key]);
    const header = ['District', ...activeSeries.map(s => s.label)];
    const colors = activeSeries.map(s => s.color);

    // 4. Construct Data Rows (Inner Join Logic + Visible Data Filter)
    const dataRows: any[][] = [];
    const distCodes = Object.keys(districtAggregates).map(Number);

    distCodes.forEach(dCode => {
      // Join with Districts Master to get Name
      const distInfo = districts.find(d => d.Dist_Code === dCode);
      if (distInfo) {
        const stats = districtAggregates[dCode];
        const row = [distInfo.Dist_Name_Hi];
        let totalVisibleValue = 0;
        
        // Push values only for visible series
        activeSeries.forEach(s => {
          const val = stats[s.key];
          row.push(val);
          totalVisibleValue += val;
        });
        
        // Only add row if there is at least one non-zero value in the visible columns
        // This hides the district from X-Axis if checked items have 0 value
        if (totalVisibleValue > 0) {
            dataRows.push(row);
        }
      }
    });

    // Sort by District Name (Hindi)
    dataRows.sort((a, b) => (a[0] as string).localeCompare(b[0] as string));

    return { 
      chartData: [header, ...dataRows], 
      currentColors: colors 
    };

  }, [incidents, year, visibleSeries]);

  const options = {
    title: `जिला वार क्षति का विश्लेषण - वर्ष ${year}`,
    isStacked: true,
    hAxis: {
      title: 'जिला (District)',
      textStyle: { fontSize: 12 },
      slantedText: true,
      slantedTextAngle: 45
    },
    vAxis: {
      title: 'क्षति की मात्रा (Quantity)',
      minValue: 0,
    },
    chartArea: { width: '85%', height: '60%', top: 50, bottom: 120 },
    legend: { position: 'none' }, // We are building a custom legend
    colors: currentColors.length > 0 ? currentColors : ['#ccc'], 
    backgroundColor: 'transparent',
    // animation: {
    //     startup: true,
    //     easing: 'out',
    //     duration: 500,
    // },
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-1">
          क्षति का ग्राफिकल विश्लेषण (जिला वार)
        </h2>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded shadow border">
            <label className="font-semibold text-gray-700">वर्ष :</label>
            <select 
                value={year} 
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="border-none outline-none bg-transparent font-medium cursor-pointer"
            >
                {[2020, 2021, 2022, 2023, 2024, 2025].map(y => (
                <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Interactive Legend / Checkboxes */}
      <div className="flex flex-wrap gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 justify-center">
        {SERIES_CONFIG.map((series) => (
          <label key={series.key} className="flex items-center space-x-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={visibleSeries[series.key]}
              onChange={() => toggleSeries(series.key)}
              className="w-5 h-5 rounded focus:ring-offset-0 focus:ring-0 cursor-pointer"
              style={{ accentColor: series.color }}
            />
            <span 
              className={`font-medium transition-colors ${visibleSeries[series.key] ? 'text-gray-800' : 'text-gray-400'}`}
            >
              {series.label}
            </span>
            <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: visibleSeries[series.key] ? series.color : '#cbd5e1' }}
            ></span>
          </label>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4 overflow-hidden min-h-[600px]">
        {chartData.length > 1 && currentColors.length > 0 ? (
             <Chart
                key={`district-chart-${year}-${currentColors.join('')}`} // Force re-render on structure change
                chartType="ColumnChart"
                width="100%"
                height="100%"
                data={chartData}
                options={options}
                chartPackages={["corechart"]}
             />
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span>चयनित मापदंडों के लिए कोई डेटा उपलब्ध नहीं है (No data available for selected criteria)</span>
            </div>
        )}
      </div>
    </div>
  );
};
