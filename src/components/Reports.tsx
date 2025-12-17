
import React, { useState, useMemo } from 'react';
import type { Incident, User} from '../types';
import { tehsils, districts, masterData } from '../services/data';

// --- Types & Interfaces ---

interface ReportStats {
  lossOfLife: number;
  houseDamage: number;
  animalLoss: number;
  cropDamage: number;
  gplLoss: number;
  roadDamage: number;
}

interface FlattenedRow {
  rowKey: string;
  distCode?: number;
  distName?: string;
  distSerial?: number; // Added for correct serial numbering in detailed view
  tehCode: number;
  tehName: string;
  disasterTypeId: number | null; // null if no incident
  disasterTypeName: string;
  stats: ReportStats;
  // RowSpan calculations
  distRowSpan?: number;
  tehRowSpan?: number;
  isDistFirst?: boolean;
  isTehFirst?: boolean;
}

// --- Helper Functions ---

const calculateStats = (incidents: Incident[]): ReportStats => {
  return {
    lossOfLife: incidents.filter(i => i.DM_type_id === 1).reduce((sum, i) => sum + (i.DM_Qty || 0), 0),
    houseDamage: incidents.filter(i => i.DM_type_id === 2).reduce((sum, i) => sum + (i.DM_Qty || 0), 0),
    animalLoss: incidents.filter(i => i.DM_type_id === 3).reduce((sum, i) => sum + (i.DM_Qty || 0), 0),
    cropDamage: incidents.filter(i => i.DM_type_id === 4).reduce((sum, i) => sum + (i.DM_Qty || 0), 0),
    // GPL: Type 5 AND Subtype NOT 9
    gplLoss: incidents.filter(i => i.DM_type_id === 5 && i.DM_Subtype_id !== 9).reduce((sum, i) => sum + (i.DM_Qty || 0), 0),
    // Road: Type 5 AND Subtype 9 (Road is id 9 in masterData)
    roadDamage: incidents.filter(i => i.DM_type_id === 5 && i.DM_Subtype_id === 9).reduce((sum, i) => sum + (i.DM_Qty || 0), 0),
  };
};

const getDisasterName = (id: number | null) => {
  if (!id) return '-';
  const type = masterData.disasterTypes.find(d => d.id === id);
  return type ? type.nameHi : 'Unknown';
};

// --- District User Report Component ---

interface TehsilReportProps {
  user: User;
  incidents: Incident[];
  year: number;
  onYearChange: (year: number) => void;
}

export const TehsilReport: React.FC<TehsilReportProps> = ({ user, incidents, year, onYearChange }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  // Calculate Grand Totals for the visible selection
  const grandTotals = useMemo(() => {
    const relevantIncidents = incidents.filter(i => 
      i.Dist_Code === user.Dist_Code &&
      !i.Is_Deleted &&
      i.Inc_Year === year &&
      (selectedMonth === 'all' || i.Inc_Month === selectedMonth)
    );
    return calculateStats(relevantIncidents);
  }, [incidents, user.Dist_Code, year, selectedMonth]);

  // Prepare Data
  const tableData = useMemo(() => {
    const userTehsils = tehsils.filter(t => t.Dist_Code === user.Dist_Code);
    const rows: FlattenedRow[] = [];

    userTehsils.forEach(tehsil => {
        // Filter incidents for this tehsil and time period
        const tehsilIncidents = incidents.filter(i => 
            i.Teh_Code === tehsil.Teh_Code && 
            !i.Is_Deleted &&
            i.Inc_Year === year &&
            (selectedMonth === 'all' || i.Inc_Month === selectedMonth)
        );

        // Group by Disaster Type
        // If no incidents, we still usually list the Tehsil, but with empty stats. 
        // SQL 'Left Join' implies showing tehsil even if null.
        
        if (tehsilIncidents.length === 0) {
             rows.push({
                rowKey: `${tehsil.Teh_Code}-none`,
                tehCode: tehsil.Teh_Code,
                tehName: tehsil.Teh_Name_Hi,
                disasterTypeId: null,
                disasterTypeName: '-',
                stats: calculateStats([]),
                tehRowSpan: 1,
                isTehFirst: true
            });
        } else {
            // Find unique disaster types in these incidents
            const uniqueTypes = Array.from(new Set(tehsilIncidents.map(i => i.DS_type_id)));
            
            uniqueTypes.forEach((typeId, index) => {
                const typeIncidents = tehsilIncidents.filter(i => i.DS_type_id === typeId);
                rows.push({
                    rowKey: `${tehsil.Teh_Code}-${typeId}`,
                    tehCode: tehsil.Teh_Code,
                    tehName: tehsil.Teh_Name_Hi,
                    disasterTypeId: typeId,
                    disasterTypeName: getDisasterName(typeId),
                    stats: calculateStats(typeIncidents),
                    tehRowSpan: index === 0 ? uniqueTypes.length : 0,
                    isTehFirst: index === 0
                });
            });
        }
    });
    return rows;
  }, [incidents, user.Dist_Code, year, selectedMonth]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-1">
            घटना प्रतिवेदन (तहसील वार)
        </h2>
        
        <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded shadow border">
                <label className="font-semibold text-gray-700">वर्ष :</label>
                <select 
                    value={year} 
                    onChange={(e) => onYearChange(Number(e.target.value))}
                    className="border-none outline-none bg-transparent font-medium"
                >
                    {[2020, 2021, 2022, 2023, 2024, 2025].map(y => (
                    <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded shadow border">
                <label className="font-semibold text-gray-700">माह :</label>
                <select 
                    className="border-none outline-none bg-transparent font-medium" 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                    <option value="all">सभी माह</option>
                    {Array.from({length: 12}, (_, i) => (
                        <option key={i} value={i+1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
        <table className="min-w-full leading-normal border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">क्र.</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">तहसील का नाम</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">आपदा विवरण</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">जनहानि संख्या</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">मकान क्षति संख्या</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">पशु हानि संख्या</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">फसल क्षति (हेक्टेयर में)</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">शासकीय परिसंपत्ति क्षति हानि</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">सड़क क्षति (कि.मी. में)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
                <tr key={row.rowKey} className="border-b border-gray-200 hover:bg-gray-50 text-center text-gray-700">
                    {/* S.No - Show only if it's the first row for this tehsil */}
                    {row.isTehFirst ? (
                         <td rowSpan={row.tehRowSpan} className="px-4 py-3 text-sm border border-gray-300 bg-white align-middle">{idx + 1}</td> 
                    ) : null}
                    
                    {row.isTehFirst ? (
                        <td rowSpan={row.tehRowSpan} className="px-4 py-3 text-sm border border-gray-300 bg-white align-middle font-medium text-left">
                            {row.tehName}
                        </td>
                    ) : null}

                    <td className="px-4 py-3 text-sm border border-gray-300 text-left">{row.disasterTypeName}</td>
                    <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.lossOfLife}</td>
                    <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.houseDamage}</td>
                    <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.animalLoss}</td>
                    <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.cropDamage}</td>
                    <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.gplLoss}</td>
                    <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.roadDamage}</td>
                </tr>
            ))}
            {/* Grand Total Row */}
            <tr className="bg-gray-200 border-t-2 border-gray-400 text-center text-gray-800 font-bold">
                <td colSpan={3} className="px-4 py-3 text-right border border-gray-300">कुल योग (Grand Total) :</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.lossOfLife}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.houseDamage}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.animalLoss}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.cropDamage}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.gplLoss}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.roadDamage}</td>
            </tr>
            {tableData.length === 0 && (
                <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">कोई डेटा उपलब्ध नहीं है (No Data Available)</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- State / Admin Report Component ---

interface MonitoringReportProps {
  incidents: Incident[];
  year: number;
  onYearChange: (year: number) => void;
}

export const MonitoringReport: React.FC<MonitoringReportProps> = ({ incidents, year, onYearChange }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('detailed'); // 'summary' = 2.2, 'detailed' = 2.1
  const [selectedDisasterType, setSelectedDisasterType] = useState<number | 'all'>('all');

  // Calculate Grand Totals
  const grandTotals = useMemo(() => {
    const relevantIncidents = incidents.filter(i => 
      !i.Is_Deleted &&
      i.Inc_Year === year &&
      (selectedMonth === 'all' || i.Inc_Month === selectedMonth) &&
      (selectedDisasterType === 'all' || i.DS_type_id === selectedDisasterType)
    );
    return calculateStats(relevantIncidents);
  }, [incidents, year, selectedMonth, selectedDisasterType]);

  // Determine if Disaster Column should be hidden (Only in detailed view when a specific disaster is selected)
  const showDisasterColumn = reportType === 'detailed' && selectedDisasterType === 'all';

  // Prepare Data based on Report Type
  const tableData = useMemo(() => {
    const rows: any[] = [];
    
    // Sort districts by name or code to ensure consistent order
    const sortedDistricts = [...districts].sort((a,b) => a.Dist_Name_Hi.localeCompare(b.Dist_Name_Hi));

    // Serial Counter for Detailed View
    let detailedDistSerial = 1;

    sortedDistricts.forEach((dist, dIdx) => {
        const distIncidents = incidents.filter(i => 
            i.Dist_Code === dist.Dist_Code &&
            !i.Is_Deleted &&
            i.Inc_Year === year &&
            (selectedMonth === 'all' || i.Inc_Month === selectedMonth) &&
            (selectedDisasterType === 'all' || i.DS_type_id === selectedDisasterType)
        );

        if (reportType === 'summary') {
            // 2.2 - District-wise Summary Report
            // Group only by District
            rows.push({
                rowKey: `dist-${dist.Dist_Code}`,
                sNo: dIdx + 1,
                distName: dist.Dist_Name_Hi,
                stats: calculateStats(distIncidents)
            });
        } else {
            // 2.1 - Tehsil-wise Report (Group by District -> Tehsil -> Disaster Type)
            const distTehsils = tehsils.filter(t => t.Dist_Code === dist.Dist_Code);
            
            // We need to calculate how many rows this district will span
            const districtRows: FlattenedRow[] = [];
            
            if (distTehsils.length === 0) return; // Skip if no tehsils (unlikely)

            distTehsils.forEach(tehsil => {
                const tehsilIncidents = distIncidents.filter(i => i.Teh_Code === tehsil.Teh_Code);

                if (tehsilIncidents.length === 0) {
                     districtRows.push({
                        rowKey: `${tehsil.Teh_Code}-none`,
                        distCode: dist.Dist_Code,
                        distName: dist.Dist_Name_Hi,
                        tehCode: tehsil.Teh_Code,
                        tehName: tehsil.Teh_Name_Hi,
                        disasterTypeId: null,
                        disasterTypeName: '-',
                        stats: calculateStats([]),
                        tehRowSpan: 1,
                        isTehFirst: true
                    });
                } else {
                    const uniqueTypes = Array.from(new Set(tehsilIncidents.map(i => i.DS_type_id)));
                    uniqueTypes.forEach((typeId, tIdx) => {
                        const typeIncidents = tehsilIncidents.filter(i => i.DS_type_id === typeId);
                        districtRows.push({
                            rowKey: `${tehsil.Teh_Code}-${typeId}`,
                            distCode: dist.Dist_Code,
                            distName: dist.Dist_Name_Hi,
                            tehCode: tehsil.Teh_Code,
                            tehName: tehsil.Teh_Name_Hi,
                            disasterTypeId: typeId,
                            disasterTypeName: getDisasterName(typeId),
                            stats: calculateStats(typeIncidents),
                            tehRowSpan: tIdx === 0 ? uniqueTypes.length : 0,
                            isTehFirst: tIdx === 0
                        });
                    });
                }
            });

            // Mark first row of district and set rowspan
            if (districtRows.length > 0) {
                districtRows[0].isDistFirst = true;
                districtRows[0].distRowSpan = districtRows.length;
                districtRows[0].distSerial = detailedDistSerial++; // Assign sequential number
                
                // Add to main rows
                rows.push(...districtRows);
            }
        }
    });

    return rows;
  }, [incidents, year, selectedMonth, reportType, selectedDisasterType]);

  // Determine Grand Total ColSpan
  let grandTotalColSpan = 2; // Default for Summary
  if (reportType === 'detailed') {
      if (showDisasterColumn) {
          grandTotalColSpan = 4; // S.No + Dist + Tehsil + Disaster
      } else {
          grandTotalColSpan = 3; // S.No + Dist + Tehsil (Disaster hidden)
      }
  }

  // Get selected disaster name for header
  const selectedDisasterName = selectedDisasterType === 'all' 
    ? 'सभी' 
    : masterData.disasterTypes.find(d => d.id === selectedDisasterType)?.nameHi || 'Unknown';

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-1">
                घटना प्रतिवेदन (राज्य स्तरीय)
            </h2>
            
            <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white p-2 rounded shadow border">
                    <label className="font-semibold text-gray-700">वर्ष :</label>
                    <select 
                        value={year} 
                        onChange={(e) => onYearChange(Number(e.target.value))}
                        className="border-none outline-none bg-transparent font-medium"
                    >
                        {[2020, 2021, 2022, 2023, 2024, 2025].map(y => (
                        <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded shadow border">
                    <label className="font-semibold text-gray-700">माह :</label>
                    <select 
                        className="border-none outline-none bg-transparent font-medium" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                        <option value="all">सभी माह</option>
                        {Array.from({length: 12}, (_, i) => (
                            <option key={i} value={i+1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
            {/* Radio Buttons for Report Type */}
            <div className="flex gap-6 bg-blue-50 p-3 rounded-lg border border-blue-100 self-start">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="reportType" 
                        value="detailed" 
                        checked={reportType === 'detailed'} 
                        onChange={() => setReportType('detailed')}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`font-semibold ${reportType === 'detailed' ? 'text-blue-800' : 'text-gray-600'}`}>
                        तहसीलवार रिपोर्ट
                    </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="reportType" 
                        value="summary" 
                        checked={reportType === 'summary'} 
                        onChange={() => setReportType('summary')}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`font-semibold ${reportType === 'summary' ? 'text-blue-800' : 'text-gray-600'}`}>
                        जिलेवार संक्षिप्त रिपोर्ट
                    </span>
                </label>
            </div>

            {/* Disaster Type Filter Dropdown */}
            <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <label className="font-semibold text-blue-800">आपदा का प्रकार :</label>
                <select 
                    className="border border-blue-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-bule-500 text-sm"
                    value={selectedDisasterType} 
                    onChange={(e) => setSelectedDisasterType(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                    <option value="all">सभी </option>
                    {masterData.disasterTypes.map(d => (
                        <option key={d.id} value={d.id}>{d.nameHi}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>
      
      {/* Selected Disaster Header */}
      <div className="bg-slate-100 p-2 border border-slate-300 rounded mb-2 text-center shadow-sm">
          <h3 className="font-bold text-slate-800 text-m">
              आपदा का प्रकार : <span className="text-blue-700">{selectedDisasterName}</span>
          </h3>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
        <table className="min-w-full leading-normal border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">क्र.</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">जिले का नाम</th>
              
              {/* Only show Tehsil in Detailed View */}
              {reportType === 'detailed' && (
                  <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">तहसील का नाम</th>
              )}

              {/* Show Disaster Type Column Only if "All" is selected in Detailed View */}
              {showDisasterColumn && (
                  <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">आपदा विवरण</th>
              )}

              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">जनहानि संख्या</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">मकान क्षति संख्या</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">पशु हानि संख्या</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">फसल क्षति (हेक्टेयर में)</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">शासकीय परिसंपत्ति क्षति हानि</th>
              <th className="px-4 py-3 text-center text-sm font-bold border border-gray-300">सड़क क्षति (कि.मी. में)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
                tableData.map((row) => {
                    // Summary View Render
                    if (reportType === 'summary') {
                        return (
                            <tr key={row.rowKey} className="border-b border-gray-200 hover:bg-gray-50 text-center text-gray-700">
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.sNo}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300 text-left font-medium">{row.distName}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.lossOfLife}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.houseDamage}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.animalLoss}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.cropDamage}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.gplLoss}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.roadDamage}</td>
                            </tr>
                        );
                    } 
                    
                    // Detailed View Render
                    else {
                        return (
                            <tr key={row.rowKey} className="border-b border-gray-200 hover:bg-gray-50 text-center text-gray-700">
                                {row.isDistFirst ? (
                                    <>
                                        <td rowSpan={row.distRowSpan} className="px-4 py-3 text-sm border border-gray-300 bg-white align-middle font-bold">
                                            {row.distSerial}
                                        </td>
                                        <td rowSpan={row.distRowSpan} className="px-4 py-3 text-sm border border-gray-300 bg-white align-middle font-bold text-left">
                                            {row.distName}
                                        </td>
                                    </>
                                ) : null}

                                {row.isTehFirst ? (
                                    <td rowSpan={row.tehRowSpan} className="px-4 py-3 text-sm border border-gray-300 bg-white align-middle text-left">
                                        {row.tehName}
                                    </td>
                                ) : null}

                                {showDisasterColumn && (
                                    <td className="px-4 py-3 text-sm border border-gray-300 text-left">{row.disasterTypeName}</td>
                                )}
                                
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.lossOfLife}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.houseDamage}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.animalLoss}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.cropDamage}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.gplLoss}</td>
                                <td className="px-4 py-3 text-sm border border-gray-300">{row.stats.roadDamage}</td>
                            </tr>
                        );
                    }
                })
            ) : null}
            
            {/* Grand Total Row */}
            <tr className="bg-gray-200 border-t-2 border-gray-400 text-center text-gray-800 font-bold">
                <td colSpan={grandTotalColSpan} className="px-4 py-3 text-right border border-gray-300">कुल योग (Grand Total) :</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.lossOfLife}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.houseDamage}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.animalLoss}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.cropDamage}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.gplLoss}</td>
                <td className="px-4 py-3 border border-gray-300">{grandTotals.roadDamage}</td>
            </tr>

            {tableData.length === 0 && (
                <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">कोई डेटा उपलब्ध नहीं है (No Data Available)</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
